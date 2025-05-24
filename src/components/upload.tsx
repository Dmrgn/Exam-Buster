"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { pb } from "@/lib/db";

export default function Upload({isShown}) {
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await createAssignment();
            window.location.reload();
        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    const currentUserId = pb.authStore.record.id;

    async function createAssignment() {
        const newAssignment = await pb
            .collection('assignments')
            .create({
                title: "",
                summary: "",
                userId: currentUserId,
                file
            });
        const {title, summary} = await (await fetch(`/api/summary?id=${encodeURIComponent(newAssignment.id)}`)).json();
        console.log(title, summary);
        await pb.collection('assignments').update(newAssignment.id, {
            title,
            summary
        })
    }

    if (!isShown) return <></>;

    return (
        <>
            <div className="absolute left-1/2 top-1/2 -translate-1/2 z-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload a File</CardTitle>
                        <CardDescription>Select a file to upload and click the submit button.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon className="w-10 h-10 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 5MB)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-sm text-red-500">{errorMessage}</p>
                            {file && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <Button type="submit">Upload</Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

function UploadIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    )
}