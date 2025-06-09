import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import "../../../styles/index.css";
import { useState } from "react";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { FileTextIcon, CircleUserIcon, ChevronDown, GithubIcon } from "lucide-react";
import { MathJaxContext, MathJax } from "better-react-mathjax";

async function deleteAssignment(id: string) {
    await pb.collection("assignments").delete(id);
    window.location.reload();
}

export function AssignmentCard({ assignment }: { assignment: RecordModel }) {
    const [expanded, setExpanded] = useState(false);
    const summary = assignment.summary as string;
    const isLong = summary.length > 100;
    return (
        <Card className="bg-primary w-full">
            <CardTitle className="pt-4 mx-2 md:mx-4 flex items-center">
                <FileTextIcon className="mr-2" size={20} />
                {assignment.title}
            </CardTitle>
            <CardContent className="pt-2 flex flex-col">
                <MathJax>
                    <p>{expanded || !isLong ? summary : summary.slice(0, 100) + '...'}</p>
                    <div className="flex justify-between">
                        {isLong && (
                            <Button variant="link" size="sm" className="p-0 mt-1 text-white" onClick={() => setExpanded(!expanded)}>
                                {expanded ? 'Show less' : 'Show more'}
                            </Button>
                        )}
                        <Button onClick={() => deleteAssignment(assignment.id)} className="bg-white hover:bg-gray-300 cursor-pointer px-2" >❌</Button>
                    </div>
                </MathJax>
            </CardContent>
        </Card>
    );
}