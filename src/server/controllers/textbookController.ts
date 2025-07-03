import { pb } from '@/lib/db';
import { createWorker } from 'tesseract.js';
import pdf from 'pdf-parse';
import { Poppler } from 'pdf-poppler';
import { openai } from '@/lib/ai';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import embeddings from "@themaximalist/embeddings.js";

type JobStatus = {
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    stage: string;
    error?: string;
};

const jobs = new Map<string, JobStatus>();

async function processTextbook(jobId: string, pdfBuffer: Buffer, classId: string) {
    jobs.set(jobId, { status: 'processing', progress: 5, stage: 'Analyzing PDF...' });

    // Clear out old chunks for this class first
    const oldChunks = await pb.collection('textbook_chunks').getFullList({ filter: `classId = "${classId}"` });
    for (const chunk of oldChunks) {
        await pb.collection('textbook_chunks').delete(chunk.id);
    }

    const data = await pdf(pdfBuffer, {
        pagerender: async (pageData) => {

            const pageNumber = pageData.pageNumber;
            const textData = await pageData.getTextContent();
            let lastY, textContent = '';
            for (let item of textData.items) {
                if (lastY == item.transform[5] || !lastY) {
                    textContent += item.str;
                }
                else {
                    textContent += '\n' + item.str;
                }
                lastY = item.transform[5];
            }

            const progress = 5 + Math.round((pageNumber / pageData.transport.numPages) * 90);
            jobs.set(jobId, { status: 'processing', progress, stage: `Processing page ${pageNumber}/${pageData.transport.numPages}` });

            const chunks = textContent.split(/\n\s*\n/).filter(chunk => chunk.trim().split(" ").length > 10);

            for (const chunkText of chunks) {
                const embeddingResponse = await embeddings(chunkText);

                await pb.collection('textbook_chunks').create({
                    classId,
                    chunk_text: chunkText,
                    embedding: JSON.stringify(embeddingResponse),
                    metadata: JSON.stringify({ page: pageNumber }),
                });
            }
            return textContent;
        }
    });

    jobs.set(jobId, { status: 'completed', progress: 100, stage: 'Done' });
    await pb.collection('classes').update(classId, {
        textbook_status: 'ready',
    });
}

export async function uploadTextbook(classId: string, file: File) {
    const jobId = `${classId}-${Date.now()}`;
    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    jobs.set(jobId, {
        status: 'queued',
        progress: 0,
        stage: 'Starting...',
    });

    processTextbook(jobId, pdfBuffer, classId).catch((err) => {
        console.error(`Job ${jobId} failed`, err);
        jobs.set(jobId, {
            status: 'failed',
            progress: 100,
            stage: 'Error',
            error: err.message,
        });
    });

    // Update the class to indicate processing has started
    await pb.collection('classes').update(classId, {
        textbook_status: 'processing',
        textbook: file,
        textbook_job_id: jobId,
    });

    return { jobId };
}

export async function getJobStatus(jobId: string) {
    const job = jobs.get(jobId);
    if (!job) {
        return { status: 'failed', progress: 100, stage: 'Error', error: 'Job not found' };
    }
    return job;
}
