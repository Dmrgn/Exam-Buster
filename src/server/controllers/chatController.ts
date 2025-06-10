import type { BunRequest } from 'bun';
import type { FileOutput } from 'replicate';
import type { BraveRoot } from '@/lib/braveTypes';
import { z } from 'zod';
import { pb } from '@/lib/db';
import { fetchPdfText } from '@/lib/pdf';
import { cerebras, openai, CHAT_SYSTEM_PROMPT, CHAT_TOOLS, replicate, IMAGE_ASPECT_RATIOS } from '@/lib/ai';
import { config } from '../../lib/config.server';
import { NodeHtmlMarkdown } from 'node-html-markdown'

/**
 * POST /api/chat
 * Body: { userId, chatId, content, files? }
 * Handles a user message, optional file attachment, and returns chatId.
 */
export async function postChat(req: BunRequest): Promise<Response> {
    try {
        // Validate body
        const schema = z.object({
            userId: z.string().nonempty(),
            chatId: z.string().nonempty(),
            content: z.string().nonempty(),
            files: z.array(z.string()).optional(),
        });
        const { userId, chatId, content, files } = schema.parse(await req.json());

        // Prepare file message if present
        const fileMsgs: any[] = [];
        if (files && files.length > 0) {
            const fileName = files[0];
            const fileType = fileName.split('.').pop()?.toLowerCase() || '';
            const fileUrl = `${config.pocketbaseUrl}/api/files/chats/${chatId}/${fileName}`;
            if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
                const arrayBuf = await (await fetch(fileUrl)).arrayBuffer();
                const imageData = Buffer.from(arrayBuf).toString('base64');
                const dataUri = `data:image/${fileType};base64,${imageData}`;
                const aiRes = await openai.chat.completions.create({
                    model: 'google/gemini-2.0-flash-exp:free',
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
                fileMsgs.push({ role: 'user', content: `File type: ${fileType} File data: ${aiRes.choices[0].message.content.slice(0, 5000)}` });
            } else if (fileType === 'pdf') {
                const pdfText = await fetchPdfText(fileUrl);
                fileMsgs.push({ role: 'user', content: `File type: ${fileType} File data: ${pdfText.slice(0, 5000)}` });
            } else {
                fileMsgs.push({ role: 'user', content: `File type: ${fileType} not supported. Please upload PNG/JPG/WebP or PDF.` });
            }
        }

        // Fetch existing chat messages
        const chat = await pb.collection('chats').getOne(chatId);
        const msgs = Array.isArray(chat.messages) ? [...chat.messages] : [];
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
                    const input = {
                        prompt: args.prompt,
                        aspect_ratio: (IMAGE_ASPECT_RATIOS.includes(args.aspectRatio) ? args.aspect_ratio : "1:1"),
                    };
                    const output: FileOutput[] = await replicate.run("black-forest-labs/flux-schnell", { input });
                    const imageBlob = await output[0].blob();
                    const imageFile = new File([imageBlob], 'image.webp', { type: imageBlob.type });
                    const fileRecord = await pb.collection("chats").update(chatId, { "files+": imageFile });
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
                } else if (fn.name === 'desmos') {
                    // Handle desmos graphing tool: generate code block for frontend
                    const { expressions } = args as { expressions: string[] };
                    toolMsgs.push({ role: 'tool', content: 'This message is not visible to the user, so please repeat the following as part of your response in order to display the graph to the user: ```desmos\n' + expressions.join('\n') + '\n```', tool_call_id: fnCall.id });
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

        return new Response(JSON.stringify({ chatId }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('postChat error:', err);
        if (err instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Invalid request payload' }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500 });
    }
}