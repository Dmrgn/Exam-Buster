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
        console.log(chunk);
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
    // Main try-catch for controller logic, including subscription checks
    try {
        // Validate body
        const schema = z.object({
            userId: z.string().nonempty(),
            chatId: z.string().nonempty(),
            content: z.string().nonempty(),
            files: z.array(z.string()).optional(),
        });
        const { userId, chatId, content, files } = schema.parse(await req.json());

        // Subscription Check for 'chat' feature
        await checkAndUpdateUsage(userId, 'chat', 1);

        // Prepare file message if present
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

        // Fetch existing chat messages
        const chat = await pb.collection('chats').getOne(chatId);
        const msgs = Array.isArray(chat.messages) ? [...chat.messages] : [];

        // Check if this is the first message
        if (msgs.length === 0) {
            try {
                // Generate chat name using Llama 3.1 8b
                const namePrompt = `Here is the first message in a chat: "${content}". Respond with the topic this chat is about. Respond with only the topic, in less than 4 words.`;
                const nameAiRes = await cerebras.chat.completions.create({
                    model: 'llama3.1-8b',
                    messages: [{ role: 'user', content: namePrompt }],
                    max_tokens: 20, // Limit the length of the generated name
                });
                const generatedName = nameAiRes.choices[0].message.content.trim();

                // Generate chat topic
                const chats = (await pb.collection('chats').getList(1, 20)).items;
                const topics = Array.from(new Set(chats.filter(x => x.topic !== "")).values()).join(', ');
                const topicPrompt = `Here is a subtopic: ${generatedName}. Which of the following topics does this subtopic belong? If it doesn't belong to any, then return a new topic name to put it under. Respond with the topic name and nothing else. ${topics}`;
                const topicAiRes = await cerebras.chat.completions.create({
                    model: 'llama3.1-8b',
                    messages: [{ role: 'user', content: topicPrompt }],
                    max_tokens: 20, // Limit the length of the generated topic
                });
                const generatedTopic = topicAiRes.choices[0].message.content.trim();

                // Update chat with the generated name
                await pb.collection('chats').update(chatId, { name: generatedName, topic: generatedTopic });

            } catch (nameErr) {
                console.error('Error generating or saving chat name:', nameErr);
                // Continue without a generated name if there's an error
            }
        }

        msgs.push({ role: 'user', content });
        await pb.collection('chats').update(chatId, { messages: msgs });

        // Tool-driven loop
        const toolMsgs: any[] = [];
        let toolDepth = 0;
        let wasToolCalled = true;
        let finalMessage = '';
        while (toolDepth < 10 && wasToolCalled) {
            toolDepth += 1;
            wasToolCalled = false;
            const aiRes = await cerebras.chat.completions.create({
                model: 'qwen-3-32b',
                messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT }, ...msgs, ...toolMsgs, ...fileMsgs],
                tools: CHAT_TOOLS,
            });
            const choice = aiRes.choices[0].message;
            if (choice.tool_calls) {
                const fnCall = choice.tool_calls[0];
                const fn = fnCall.function;
                const args = JSON.parse(fn.arguments);
                wasToolCalled = true;
                toolMsgs.push(choice);
                if (fn.name === 'image_gen') {
                    // Check for 'image gen' feature
                    await checkAndUpdateUsage(userId, 'image gen', 1);

                    const input = {
                        prompt: args.prompt,
                        aspect_ratio: (IMAGE_ASPECT_RATIOS.includes(args.aspectRatio) ? args.aspect_ratio : "1:1"),
                    };

                    const output = await replicate.run("black-forest-labs/flux-schnell", { input }) as unknown as FileOutput[];
                    const imageBlob = await output[0].blob();
                    const imageFile = new File([imageBlob], 'image.webp', { type: imageBlob.type });

                    const generatedImageMb = imageBlob.size / (1024 * 1024);

                    // Check for 'file upload' feature for the generated image size
                    await checkAndUpdateUsage(userId, 'file upload', generatedImageMb);

                    // If both checks passed, proceed to update and increment
                    const fileRecord = await pb.collection("chats").update(chatId, {
                        "files+": imageFile,
                        "totalUploadedMb+": generatedImageMb // Add to chat's total uploaded MB
                    });

                    await incrementUsage(userId, 'image gen', 1);
                    await incrementUsage(userId, 'file upload', generatedImageMb);

                    const fileUrl = `${config.pocketbaseUrl}/api/files/chats/${chatId}/${fileRecord.files[fileRecord.files.length - 1]}`;
                    toolMsgs.push({ role: 'tool', content: `Here is the generated image. This message is not visible to the user, so please repeat the image Markdown: ![${args.prompt}](${fileUrl})`, tool_call_id: fnCall.id });

                } else if (fn.name === 'search') {
                    const results: BraveRoot = await (await fetch(`https://api.search.brave.com/res/v1/web/search?q=${args.query}`, {
                        method: 'get',
                        headers: {
                            'Accept': 'application/json',
                            'Accept-Encoding': 'gzip',
                            'x-subscription-token': process.env["BRAVE_API_KEY"],
                        },
                    })).json();
                    const toolResponse = results.web.results
                        .map(x => `\n## ${x.title}\nUrl: ${x.url}\nDescription: ${x.description}\nAge: ${x.age ?? 'unknown'}`)
                        .slice(0, 8)
                        .join('\n');
                    toolMsgs.push({ role: 'tool', content: toolResponse, tool_call_id: fnCall.id });
                } else if (fn.name === 'openUrl') {
                    const textContent = await (await fetch(args.url)).text();
                    const markdown = NodeHtmlMarkdown.translate(textContent);
                    toolMsgs.push({ role: 'tool', content: markdown.slice(0, 3000), tool_call_id: fnCall.id });
                } else if (fn.name === 'query_textbook') {
                    const { query } = args;
                    const results = await queryTextbook(query, chat.class);
                    const context = results.map(r => `Page ${r.metadata.page}: ${r.chunk_text}`).join('\n\n');
                    toolMsgs.push({ role: 'tool', content: `Context from textbook:\n${context}`, tool_call_id: fnCall.id });
                } else if (fn.name === 'desmos') {
                    // Check for 'graphing' feature
                    await checkAndUpdateUsage(userId, 'graphing', 1);

                    // Handle desmos graphing tool: generate code block for frontend
                    const { expressions } = args as { expressions: string[] };
                    toolMsgs.push({ role: 'tool', content: 'This message is not visible to the user, so please repeat the following as part of your response in order to display the graph to the user: ```desmos\n' + expressions.join('\n') + '\n```', tool_call_id: fnCall.id });

                    // Increment 'graphing' usage
                    await incrementUsage(userId, 'graphing', 1);
                } else {
                    console.error('Unknown tool:', fn.name);
                }
            } else {
                finalMessage = choice.content;
            }
        }

        // Append assistant response
        msgs.push({ role: 'assistant', content: finalMessage });
        await pb.collection('chats').update(chatId, { messages: msgs });

        // Increment chat usage after successful processing
        await incrementUsage(userId, 'chat', 1);

        return new Response(JSON.stringify({ chatId }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('postChat error:', err);
        if (err instanceof SubscriptionError) {
            // Handle subscription errors specifically
            const status = err.type === 'limit_reached' ? 429 : 403; // 429 for rate limit, 403 for forbidden
            return new Response(
                JSON.stringify({
                    error: err.message,
                    type: err.type,
                    feature: err.feature,
                    limit: err.limit,
                }),
                { status }
            );
        }
        if (err instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Invalid request payload' }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500 });
    }
}
