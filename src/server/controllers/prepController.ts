import type { Request } from 'bun';
import { z } from 'zod';
import { pb } from '@/lib/db';
import { fetchPdfText } from '@/lib/pdf';
import { cerebras, PREP_SYSTEM_PROMPT } from '@/lib/ai';
import { config } from '../../lib/config.server';

/**
 * GET /api/prep?id=<userId>
 * Generates study plans for a user based on their recent assignments.
 */
export async function getPrep(req: Request): Promise<Response> {
    try {
        // Validate userId param
        const params = Object.fromEntries(new URL(req.url).searchParams.entries());
        const { id: userId } = z.object({ id: z.string().nonempty() }).parse(params);

        // Fetch recent assignments for the user
        const { items: assignments } = await pb.collection('assignments').getList(1, 50, {
            filter: `userId = "${userId}"`,
            sort: '-created',
        });

        // Generate study plan for up to 5 assignments
        const responses = await Promise.all(
            assignments.slice(0, 5).map(async (asgmt) => {
                const fileName = asgmt.file as string;
                const fileUrl = `${config.pocketbaseUrl}/api/files/assignments/${asgmt.id}/${fileName}`;
                const pdfText = await fetchPdfText(fileUrl);
                const aiRes = await cerebras.chat.completions.create({
                    model: 'qwen-3-32b',
                    messages: [
                        { role: 'system', content: PREP_SYSTEM_PROMPT },
                        { role: 'user', content: pdfText.slice(0, 4000) },
                    ],
                    max_tokens: 5000,
                });
                // Expect JSON payload after </think> tag
                const parts = aiRes.choices[0]?.message?.content.split('</think>');
                if (!parts || parts.length < 2) {
                    throw new Error('AI response missing JSON payload');
                }
                return JSON.parse(parts[1].trim());
            })
        );

        // Persist prep entries
        pb.autoCancellation(false);
        for (const plan of responses) {
            await pb.collection('prep').create({ ...plan, userId });
        }
        pb.autoCancellation(true);

        return new Response(JSON.stringify({ status: 'Success' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('getPrep error:', err);
        if (err instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Invalid or missing parameter: id' }), { status: 400 });
        }
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500 });
    }
}