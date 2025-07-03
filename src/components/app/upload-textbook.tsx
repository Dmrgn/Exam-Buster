import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type UploadTextbookProps = {
    classId: string;
    onComplete: () => void;
};

export default function UploadTextbook({ classId, onComplete }: UploadTextbookProps) {
    const [file, setFile] = useState<File | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/textbook/${classId}`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setJobId(data.jobId);
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
    };

    useEffect(() => {
        if (!jobId) return;

        async function updateProgress() {
            try {
                const res = await fetch(`/api/textbook/status/${jobId}`);
                const data = await res.json();
                setStatus(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(interval);
                    if (data.status === 'completed') {
                        onComplete();
                    } else {
                        setError(data.error || 'Processing failed');
                    }
                }
            } catch (err) {
                setError('Failed to get job status.');
                clearInterval(interval);
            }
        }

        updateProgress();
        const interval = setInterval(updateProgress, 2000);

        return () => clearInterval(interval);
    }, [jobId, onComplete]);

    return (
        <div className='flex flex-col gap-2'>
            <Input type="file" onChange={handleFileChange} accept=".pdf" />
            {jobId && status && (
                <div>
                    <p>{status.stage}</p>
                    <Progress value={status.progress} />
                </div>
            )}
            <Button className='mr-auto' onClick={handleUpload} disabled={!file || !!jobId}>
                Upload
            </Button>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}
