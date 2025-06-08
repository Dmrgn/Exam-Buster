import type { Request } from 'bun';
import { z } from 'zod';
import { pb } from '@/lib/db';
import { fetchPdfText } from '@/lib/pdf';
import { cerebras, openai, CHAT_SYSTEM_PROMPT, CHAT_TOOLS } from '@/lib/ai';
import { config } from '../../lib/config.server';

/**
 * POST /api/chat
 * Body: { userId, chatId, content, files? }
 * Handles a user message, optional file attachment, and returns chatId.
 */
export async function postChat(req: Request): Promise<Response> {
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
                    messages: [
                        { role: 'user', content: "What's in this image? If it contains text then extract the text from the image." },
                        { type: 'image_url', image_url: { url: dataUri } } as any,
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
                model: 'llama-4-scout-17b-16e-instruct',
                messages: [{ role: 'system', content: CHAT_SYSTEM_PROMPT }, ...msgs, ...toolMsgs, ...fileMsgs],
                tools: CHAT_TOOLS,
            });
            const choice = aiRes.choices[0].message;
            if (choice.tool_calls) {
                const fnCall = choice.tool_calls[0];
                const fn = fnCall.function;
                const args = JSON.parse(fnCall.arguments);
                wasToolCalled = true;
                toolMsgs.push(choice);
                // Example tool: weather
                if (fn.name === 'weather') {
                    // TODO: call actual weather API
                    toolMsgs.push({ role: 'tool', content: 'Rainy and 30°C', tool_call_id: fnCall.id });
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