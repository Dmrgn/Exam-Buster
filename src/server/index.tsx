import { serve } from "bun";
import index from "@/frontend/index.html";
import { pb } from "../lib/db";
import { CHAT_SYSTEM_PROMPT, CHAT_TOOLS, client, PREP_SYSTEM_PROMPT } from "@/lib/ai";
import { fetchPdfText } from "@/lib/pdf";

const server = serve({
    routes: {
        "/*": index,

        "/api/summary": {
            GET: async (req) => {
                const { searchParams } = new URL(req.url);
                const item: string = searchParams.get("id");
                if (!item) return Response.json({
                    summary: "Untitled Assignment"
                });
                const assignment = await pb.collection("assignments").getOne(item);
                const fileName = assignment.file;
                const fileUrl = `${process.env.POCKETBASE_URL}/api/files/assignments/${item}/${fileName}`;
                // Fetch and parse PDF text
                const pdfText = await fetchPdfText(fileUrl);

                const completion = await client.chat.completions.create({
                    model: "llama3.1-8b",
                    messages: [
                        { role: "system", content: "You are an assignment name generator. Given the text from an assignment, respond with a description name for it and a short summary of it and nothing else. Respond with the name of the assignment on one line, followed by the summary of it on the next." },
                        { role: "user", content: pdfText.slice(0, 1_000) }
                    ],
                    max_tokens: 300,
                });

                const modelResponse = (completion.choices[0]?.message?.content?.trim() || "").split("\n");

                const title = modelResponse[0]
                const summary = modelResponse[modelResponse.length - 1];
                return Response.json({ title, summary });
            }
        },

        "/api/prep": {
            GET: async (req) => {
                const { searchParams } = new URL(req.url);
                const userId: string = searchParams.get("id");

                const { items: assignments } = await pb.collection("assignments")
                    .getList(1, 50, {
                        filter: `userId = "${userId}"`,
                        sort: '-created',
                    });
                const promises = assignments.slice(0, 5).map(async (x) => {
                    const fileName = x.file;
                    const fileUrl = `${process.env.POCKETBASE_URL}/api/files/assignments/${x.id}/${fileName}`;
                    console.log(fileUrl);
                    // Fetch and parse PDF text
                    const pdfText = await fetchPdfText(fileUrl);
                    const aiResponse = await client.chat.completions.create({
                        model: "qwen-3-32b",
                        messages: [
                            { role: "system", content: PREP_SYSTEM_PROMPT },
                            { role: "user", content: pdfText.slice(0, 4_000) }
                        ],
                        max_tokens: 5_000,
                    })
                    console.log(aiResponse.choices[0]?.message?.content.split("</think>")[1].trim());
                    const jsonResponse = JSON.parse(aiResponse.choices[0]?.message?.content.split("</think>")[1].trim() ?? "");
                    return jsonResponse
                })

                const responses = await Promise.all(promises);

                pb.autoCancellation(false);
                responses.forEach(async (x) => {
                    await pb.collection('prep').create({
                        ...x,
                        userId
                    });
                })
                pb.autoCancellation(true);

                return Response.json({
                    status: "Success"
                })
            }
        },

        "/api/chat": {
            POST: async (req) => {
                const body = await req.json();
                const { userId, chatId, content } = body;
                if (!userId || !content) {
                    return Response.json({ error: "userId and content required" }, { status: 400 });
                }
                let chat;
                if (!chatId) {
                    // start new chat
                    const messages = [{ role: "user", content }];
                    console.log(userId, messages);
                    chat = await pb.collection("chats").create({ userId, messages });
                } else {
                    // continue existing chat
                    chat = await pb.collection("chats").getOne(chatId);
                    const msgs = Array.isArray(chat.messages) ? [...chat.messages] : [];
                    msgs.push({ role: "user", content });
                    await pb.collection("chats").update(chatId, { messages: msgs });

                    const toolMsgs = [];
                    let toolDepth = 0;
                    let wasToolCalled = true;
                    let finalMessage = "";
                    while (toolDepth < 10 && wasToolCalled) {
                        toolDepth++;
                        wasToolCalled = false;
                        // call AI
                        // console.log("==============================");
                        // console.log("Calling AI:");
                        // console.log([...(msgs.slice(-2)), ...toolMsgs]);
                        const aiResponse = await client.chat.completions.create({
                            model: "llama-4-scout-17b-16e-instruct",
                            messages: [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...msgs, ...toolMsgs],
                            tools: CHAT_TOOLS
                        });
                        const choice = aiResponse.choices[0].message;
                        // console.log(choice.tool_calls);
                        // check if we called a tool
                        if (choice.tool_calls) {
                            const functionCall = choice.tool_calls[0].function;
                            const functionArguments = JSON.parse(functionCall.arguments);
                            switch (functionCall.name) {
                                case "weather":
                                    wasToolCalled = true;
                                    toolMsgs.push(choice);
                                    toolMsgs.push({
                                        "role": "tool",
                                        "content": "Rainy and 30 degrees celcius.",
                                        "tool_call_id": choice.tool_calls[0].id
                                    });
                                    break;
                                default:
                                    console.error("Unknown tool used:", functionCall.name);
                                    break;
                            }
                            continue;
                        } 
                        finalMessage = choice.content;
                    }
                    msgs.push({ role: "assistant", content: finalMessage });

                    await pb.collection("chats").update(chatId, { messages: msgs });
                }
                return Response.json({ chatId: chat.id });
            }
        }
    },

    development: process.env.NODE_ENV !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
