import type { BunRequest } from 'bun';
import type { FileOutput } from 'replicate';
import type { BraveRoot } from '@/lib/braveTypes';
import { z } from 'zod';
import { pb } from '@/lib/db';
import { fetchPdfText } from '@/lib/pdf';
import { checkAndUpdateUsage, incrementUsage, SubscriptionError } from '../../lib/subscription';
import type { UserRecord, PlanRecord } from '../../lib/subscription';
import { cerebras, openai, CHAT_SYSTEM_PROMPT, CHAT_TOOLS, replicate, IMAGE_ASPECT_RATIOS } from '@/lib/ai';
import { config } from '../../lib/config.server';
import { NodeHtmlMarkdown } from 'node-html-markdown'
import embeddings from "@themaximalist/embeddings.js";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magA * magB);
}

async function queryTextbook(query: string, classId: string): Promise<any[]> {
    const queryEmbedding = await embeddings(query);

    const chunks = await pb.collection('textbook_chunks').getFullList({
        filter: `classId = "${classId}"`,
    });

    const scoredChunks = chunks.map(chunk => {
        const chunkEmbedding = chunk.embedding;
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { ...chunk, score };
    });

    return scoredChunks.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * POST /api/chat
 * Body: { userId, chatId, content, files? }
 * Handles a user message, optional file attachment, and returns chatId.
 */
export async function postChat(req: BunRequest): Promise<Response> {
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const send = (data: any) => controller.enqueue(encoder.encode(JSON.stringify(data)));

            try {
                const schema = z.object({
                    userId: z.string().nonempty(),
                    chatId: z.string().nonempty(),
                    content: z.string().nonempty(),
                    files: z.array(z.string()).optional(),
                });
                const { userId, chatId, content, files } = schema.parse(await req.json());

                await checkAndUpdateUsage(userId, 'chat', 1);

                const fileMsgs: any[] = [];
                if (files && files.length > 0) {
                    const fileName = files[0];
                    const fileType = fileName.split('.').pop()?.toLowerCase() || '';
                    const fileUrl = `${config.pocketbaseUrl}/api/files/chats/${chatId}/${fileName}`;
                    if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                        await checkAndUpdateUsage(userId, 'image view', 1);
                        const arrayBuf = await (await fetch(fileUrl)).arrayBuffer();
                        const imageData = Buffer.from(arrayBuf).toString('base64');
                        const dataUri = `data:image/${fileType};base64,${imageData}`;
                        const aiRes = await openai.chat.completions.create({
                            model: 'google/gemini-2.0-flash-exp:free',
                            // @ts-expect-error we are using openrouter which supports a models parameter, but the openai sdk doesn't like it
                            models: ["opengvlab/internvl3-14b:free", "meta-llama/llama-4-maverick:free", "qwen/qwen2.5-vl-32b-instruct:free"],
                            messages: [
                                {
                                    role: 'user', content: [
                                        { type: 'text', text: "What's in this image? If it contains text then extract the text from the image." },
                                        { type: 'image_url', image_url: { url: dataUri } }
                                    ],
                                },
                            ],
                        });
                        await incrementUsage(userId, 'image view', 1);
                        fileMsgs.push({ role: 'user', content: `File type: ${fileType} File data: ${aiRes.choices[0].message.content.slice(0, 5000)}` });
                    } else if (fileType === 'pdf') {
                        await checkAndUpdateUsage(userId, 'pdf view', 1);
                        const pdfText = await fetchPdfText(fileUrl);
                        await incrementUsage(userId, 'pdf view', 1);
                        fileMsgs.push({ role: 'user', content: `File type: ${fileType} File data: ${pdfText.slice(0, 5000)}` });
                    } else {
                        fileMsgs.push({ role: 'user', content: `File type: ${fileType} not supported. Please upload PNG/JPG/WebP or PDF.` });
                    }
                }

                const chat = await pb.collection('chats').getOne(chatId);
                const msgs = Array.isArray(chat.messages) ? [...chat.messages] : [];

                if (msgs.length === 0) {
                    try {
                        const namePrompt = `Here is the first message in a chat: "${content}". Respond with the topic this chat is about. Respond with only the topic, in less than 4 words.`;
                        const nameAiRes = await cerebras.chat.completions.create({
                            model: 'llama3.1-8b',
                            messages: [{ role: 'user', content: namePrompt }],
                            max_tokens: 20,
                        });
                        const generatedName = nameAiRes.choices[0].message.content.trim();

                        const chats = (await pb.collection('chats').getList(1, 20)).items;
                        const topics = Array.from(new Set(chats.filter(x => x.topic !== "")).values()).join(', ');
                        const topicPrompt = `Here is a subtopic: ${generatedName}. Which of the following topics does this subtopic belong? If it doesn't belong to any, then return a new topic name to put it under. Respond with the topic name and nothing else. ${topics}`;
                        const topicAiRes = await cerebras.chat.completions.create({
                            model: 'llama3.1-8b',
                            messages: [{ role: 'user', content: topicPrompt }],
                            max_tokens: 20,
                        });
                        const generatedTopic = topicAiRes.choices[0].message.content.trim();

                        await pb.collection('chats').update(chatId, { name: generatedName, topic: generatedTopic });
                    } catch (nameErr) {
                        console.error('Error generating or saving chat name:', nameErr);
                    }
                }

                msgs.push({ role: 'user', content });
                await pb.collection('chats').update(chatId, { messages: msgs });

                const toolMsgs: any[] = [];
                let toolDepth = 0;
                let isReadyToRespond = false;

                while (toolDepth < 10 && !isReadyToRespond) {
                    toolDepth += 1;

                    const aiRes = await cerebras.chat.completions.create({
                        model: 'qwen-3-32b',
                        messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT(new Date().toDateString(), true) }, ...msgs, ...toolMsgs, ...fileMsgs],
                        tools: CHAT_TOOLS,
                    });

                    const choice = aiRes.choices[0].message;

                    if (choice.tool_calls) {
                        const fnCall = choice.tool_calls[0];
                        const fn = fnCall.function;
                        const args = JSON.parse(fn.arguments);
                        send({ type: 'tool_call', name: fn.name, args });
                        toolMsgs.push(choice);

                        let toolResponseContent = '';
                        if (fn.name === 'image_gen') {
                            await checkAndUpdateUsage(userId, 'image gen', 1);
                            const input = { prompt: args.prompt, aspect_ratio: (IMAGE_ASPECT_RATIOS.includes(args.aspectRatio) ? args.aspect_ratio : "1:1") };
                            const output = await replicate.run("black-forest-labs/flux-schnell", { input }) as unknown as FileOutput[];
                            const imageBlob = await output[0].blob();
                            const imageFile = new File([imageBlob], 'image.webp', { type: imageBlob.type });
                            const generatedImageMb = imageBlob.size / (1024 * 1024);
                            await checkAndUpdateUsage(userId, 'file upload', generatedImageMb);
                            const fileRecord = await pb.collection("chats").update(chatId, { "files+": imageFile, "totalUploadedMb+": generatedImageMb });
                            await incrementUsage(userId, 'image gen', 1);
                            await incrementUsage(userId, 'file upload', generatedImageMb);
                            const fileUrl = `${config.pocketbaseUrl}/api/files/chats/${chatId}/${fileRecord.files[fileRecord.files.length - 1]}`;
                            toolResponseContent = `Here is the generated image. This message is not visible to the user, so please repeat the image Markdown: ![${args.prompt}](${fileUrl})`;
                        } else if (fn.name === 'search') {
                            const results: BraveRoot = await (await fetch(`https://api.search.brave.com/res/v1/web/search?q=${args.query}`, {
                                method: 'get',
                                headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'x-subscription-token': process.env["BRAVE_API_KEY"] },
                            })).json();
                            toolResponseContent = results.web.results.map(x => `\n## ${x.title}\nUrl: ${x.url}\nDescription: ${x.description}\nAge: ${x.age ?? 'unknown'}`).slice(0, 8).join('\n');
                        } else if (fn.name === 'openUrl') {
                            const textContent = await (await fetch(args.url)).text();
                            const markdown = NodeHtmlMarkdown.translate(textContent);
                            toolResponseContent = markdown.slice(0, 3000);
                        } else if (fn.name === 'query_textbook') {
                            const { query } = args;
                            const results = await queryTextbook(query, chat.class);
                            const context = results.map(r => `Page ${r.metadata.page}: ${r.chunk_text}`).join('\n\n');
                            toolResponseContent = `Context from textbook:\n${context}`;
                        } else if (fn.name === 'desmos') {
                            await checkAndUpdateUsage(userId, 'graphing', 1);
                            const { expressions } = args as { expressions: string[] };
                            toolResponseContent = 'This message is not visible to the user, so please repeat the following as part of your response in order to display the graph to the user: ```desmos\n' + expressions.join('\n') + '\n```';
                            await incrementUsage(userId, 'graphing', 1);
                        } else {
                            console.error('Unknown tool:', fn.name);
                        }
                        toolMsgs.push({ role: 'tool', content: toolResponseContent, tool_call_id: fnCall.id });
                        send({ type: 'tool_response', content: toolResponseContent });
                    } else {
                        isReadyToRespond = true;
                    }
                }

                if (isReadyToRespond) {
                    const finalStream = await cerebras.chat.completions.create({
                        model: 'qwen-3-32b',
                        messages: [
                            { role: 'system', content: CHAT_SYSTEM_PROMPT(new Date().toDateString(), false) },
                            ...msgs,
                            ...toolMsgs,
                            ...fileMsgs
                        ],
                        stream: true,
                    });

                    let finalMessage = '';
                    for await (const chunk of finalStream) {
                        const content = chunk.choices[0].delta.content;
                        if (content) {
                            send({ type: 'token', content });
                            finalMessage += content;
                        }
                    }
                    msgs.push({ role: 'assistant', content: finalMessage });
                    await pb.collection('chats').update(chatId, { messages: msgs });
                }

                await incrementUsage(userId, 'chat', 1);
                controller.close();
            } catch (err: any) {
                console.error('postChat error:', err);
                let errorPayload: any = { error: err.message || 'Internal server error' };
                if (err instanceof SubscriptionError) {
                    errorPayload = {
                        error: err.message,
                        type: err.type,
                        feature: err.feature,
                        limit: err.limit,
                    };
                } else if (err instanceof z.ZodError) {
                    errorPayload = { error: 'Invalid request payload' };
                }
                send({ type: 'error', ...errorPayload });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
}
