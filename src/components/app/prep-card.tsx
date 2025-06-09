import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import "../../../styles/index.css";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ClipboardListIcon } from "lucide-react";
import { MathJax } from "better-react-mathjax";

export interface PrepRecord extends RecordModel {
    title: string;
    feedback: string;
    problems: { title: string; question: string; solution: string[] }[];
}

async function deletePrep(id: string) {
    await pb.collection("prep").delete(id);
    window.location.reload();
}

export function PrepCard({ prep }: { prep: PrepRecord }) {
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center gap-2">
                <ClipboardListIcon size={20} />
                <CardTitle className="text-xl">{prep.title}</CardTitle>
            </CardHeader>
            <CardDescription className="px-6 -mt-2"><MathJax>{prep.feedback}</MathJax></CardDescription>
            <CardContent className="pt-2">
                <Accordion type="single" collapsible className="w-full">
                    {prep.problems.map((problem, pi) => (
                        <AccordionItem
                            value={`${prep.id}-prob-${pi}`} key={`${prep.id}-prob-${pi}`}
                        >
                            <AccordionTrigger className="text-lg"><MathJax>{problem.question.slice(0,50).split('`').length % 2 === 0 ? problem.question.slice(0, 50) + "`..." : problem.question.slice(0, 50)+"..."}</MathJax></AccordionTrigger>
                            <AccordionContent>
                                <p className="mb-2 text-sm"><MathJax>{problem.question}</MathJax></p>
                                <Accordion type="multiple" className="w-full ml-4">
                                    {problem.solution.map((step, si) => (
                                        <AccordionItem
                                            value={`${prep.id}-prob-${pi}-step-${si}`} key={`${prep.id}-prob-${pi}-step-${si}`}
                                        >
                                            <AccordionTrigger>Step {si + 1}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm"><MathJax>{step}</MathJax></p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Button onClick={() => deletePrep(prep.id)} variant="link" className="cursor-pointer px-0" >Delete Plan</Button>
            </CardContent>
        </Card>
    );
}