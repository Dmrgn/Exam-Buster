import { uploadTextbook, getJobStatus } from '@/server/controllers/textbookController';

export const textbookRoutes = {
    '/api/textbook/:classId': {
        POST: async (req: Request) => {
            const classId = req.url.split('/').pop() || '';
            const formData = await req.formData();
            const file = formData.get('file') as File;
            const result = await uploadTextbook(classId, file);
            return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' },
            });
        },
    },
    '/api/textbook/status/:jobId': {
        GET: async (req: Request) => {
            const jobId = req.url.split('/').pop() || '';
            const result = await getJobStatus(jobId);
            return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' },
            });
        },
    },
};
