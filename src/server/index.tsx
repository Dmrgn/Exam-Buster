import { serve } from "bun";
import index from "@/frontend/index.html";
import { pb } from "../lib/db";
import { client } from "@/lib/ai";
import { fetchPdfText } from "@/lib/pdf";

const PREP_SYSTEM_PROMPT = `
You are an expert math teacher. You will be given an assignment completed by a student (already graded by a teacher).
Your job is to prepare feedback for what the student should work on and a list of 2-3 problems you create based on the what the student needs to work on.
Return a JSON object in the following form:

{
    "title": string,
    "feedback": string,
    "problems": [
        {
            "question": string,
            "solution": [
                string
            ]
        }
    ]
}

The title should be the name of the concept you decide the student needs to work on.
The feedback should be 3-5 sentences.
Each problem you create should contain a solution, which is an array where each element is a string containing a step along the path to solve the problem.
Do not wrap your response in '\`\`\`json' or anything else, just return the JSON object.
Ensure ALL \\ are properly escaped in your response! This is very important.
Always repond with the given JSON object, even if the information you recieve is unexpected.
If you would like to write a math statement, then use AsciiMath syntax surrounded by \` characters. For example: \`frac(10)(4x) approx 2^(12)\`.
NEVER use LaTeX syntax or surround math statements with $ or $$ or $$$.
`

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
                const summary = modelResponse[modelResponse.length-1];
                return Response.json({title, summary});
            }
        },

        "/api/prep": {
            GET: async (req) => {
                const { searchParams } = new URL(req.url);
                const userId: string = searchParams.get("id");

                const {items: assignments} = await pb.collection("assignments")
                    .getList(1, 50, {
                        filter: `userId = "${userId}"`,
                        sort: '-created',
                    });
                const promises = assignments.slice(0,5).map(async (x)=>{
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
                responses.forEach(async (x)=>{
                    console.log(x, userId);
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
        }
    },

    development: process.env.NODE_ENV !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
