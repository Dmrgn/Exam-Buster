import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Upload from "@/components/upload"
import "../../styles/index.css";
import { useState } from "react";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { FileTextIcon } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ClipboardListIcon } from "lucide-react";

function AssignmentCard({ assignment }: { assignment: RecordModel }) {
    const [expanded, setExpanded] = useState(false);
    const summary = assignment.summary as string;
    const isLong = summary.length > 100;
    return (
        <Card className="bg-primary w-70">
            <CardTitle className="pt-4 mx-2 md:mx-4 flex items-center">
                <FileTextIcon className="mr-2" size={20} />
                {assignment.title}
            </CardTitle>
            <CardContent className="pt-2">
                <p>{expanded || !isLong ? summary : summary.slice(0, 100) + '...'}</p>
                {isLong && (
                    <Button variant="link" size="sm" className="p-0 mt-1 text-white" onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Show less' : 'Show more'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

// Define study plan record type with problems and feedback
interface PrepRecord extends RecordModel {
    title: string;
    feedback: string;
    problems: { title: string; question: string; solution: string[] }[];
}

// Full-width prep card with nested accordions for problems and steps
function PrepCard({ prep }: { prep: PrepRecord }) {
    return (
        <Card className="w-full">
            <CardHeader className="flex items-center gap-2">
                <ClipboardListIcon size={20} />
                <CardTitle className="text-xl">{prep.title}</CardTitle>
            </CardHeader>
            <CardDescription className="px-6 -mt-2">{prep.feedback}</CardDescription>
            <CardContent className="pt-2">
                <Accordion type="single" collapsible className="w-full">
                    {prep.problems.map((problem, pi) => (
                        <AccordionItem
                            value={`${prep.id}-prob-${pi}`} key={`${prep.id}-prob-${pi}`}
                        >
                            <AccordionTrigger className="text-lg">{problem.question.slice(0, 50)}...</AccordionTrigger>
                            <AccordionContent>
                                <p className="mb-2 text-sm">{problem.question}</p>
                                <Accordion type="multiple" className="w-full ml-4">
                                    {problem.solution.map((step, si) => (
                                        <AccordionItem
                                            value={`${prep.id}-prob-${pi}-step-${si}`} key={`${prep.id}-prob-${pi}-step-${si}`}
                                        >
                                            <AccordionTrigger>Step {si + 1}</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm">{step}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}

export function App() {

    if (!localStorage.getItem("pocketbase_auth")) window.location.replace("/login");

    const currentUserId = pb.authStore.record.id;
    const [assignments, setAssignments] = useState<RecordModel[]>();
    const [preps, setPreps] = useState<PrepRecord[]>();
    const [pending, setPending] = useState<boolean>(false);
    const [showAddAssignment, setShowAddAssignment] = useState<boolean>(false);

    async function fetchAssignment(page = 1, perPage = 50) {
        setPending(true);
        const { items: assignmentItems } = await pb
            .collection('assignments')
            .getList(page, perPage, {
                // simple string filter:
                filter: `userId = "${currentUserId}"`,
                // optional sorting, e.g. most recent first:
                sort: '-created',
            });
        const { items: prepItems } = await pb
            .collection('prep')
            .getList(page, perPage, {
                // simple string filter:
                filter: `userId = "${currentUserId}"`,
                // optional sorting, e.g. most recent first:
                sort: '-created',
            });
        setAssignments(assignmentItems);
        setPreps(prepItems);
        setPending(false);
    }

    async function createStudyPlan() {
        try {
            await (await fetch(`/api/prep?id=${encodeURIComponent(currentUserId)}`)).json();
            window.location.reload();
        } catch(e) {
            console.log(e.message);
        }
    }

    if (assignments === undefined && !pending) fetchAssignment();

    return (
        <>
            {showAddAssignment ? <div onClick={() => setShowAddAssignment(false)} className="absolute left-0 top-0 w-full h-full z-[15] bg-background/50 backdrop-blur-md "></div> : <></>}
            <Upload isShown={showAddAssignment}></Upload>
            <div className="container m-8 relative z-10 w-[90vw] h-[90vh]">
                <Card className="bg-card/50 backdrop-blur-sm border-muted min-h-[80%]">
                    <CardContent className="pt-4 mx-2 md:mx-8">
                        <h1 className="text-5xl font-bold my-4 leading-tight text-center">Exam Buster</h1>
                        <section>
                            <h2 className="text-2xl font-bold my-4 leading-tight">Assignments</h2>
                            <div className="flex gap-8 max-w-full overflow-x-auto">
                                {assignments?.length ? assignments?.map((assignment) => (
                                    <AssignmentCard assignment={assignment} key={assignment.id} />
                                )) : 'Looks like you dont have any assignments yet!'}
                            </div>
                            <Button className="mt-4" onClick={() => setShowAddAssignment(true)}>Upload Assignment</Button>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold my-4 leading-tight">Study Plans</h2>
                            <div className="flex flex-col gap-4 w-full">
                                {preps?.length ? preps?.map((prep) => (
                                    <PrepCard prep={prep} key={prep.id} />
                                )) : 'Looks like you don\'t have any study plans yet!'}
                            </div>
                            <Button className="mt-4" onClick={() => createStudyPlan()}>Create Study Plan</Button>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default App;
