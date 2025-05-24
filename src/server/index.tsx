import { serve } from "bun";
import index from "@/frontend/index.html";
import { pb } from "../lib/db";
import { client } from "@/lib/ai"
import pdf from "pdf-parse"

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
                const fileUrl = `http://127.0.0.1:8090/api/files/assignments/${item}/${fileName}`;
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`Failed to download PDF: ${response.statusText}`);
                }
                const buffer = await response.arrayBuffer();
                const pdfBuffer = Buffer.from(buffer);
                const pdfText = (await pdf(pdfBuffer)).text;

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
        }
    },

    development: process.env.NODE_ENV !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
