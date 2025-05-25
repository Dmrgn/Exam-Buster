import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Upload from "@/components/upload"
import "../../styles/index.css";
import { useState } from "react";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { FileTextIcon, CircleUserIcon, ChevronDown, GithubIcon } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ClipboardListIcon } from "lucide-react";

async function deleteAssignment(id: string) {
    await pb.collection("assignments").delete(id);
    window.location.reload();
}

async function deletePrep(id: string) {
    await pb.collection("prep").delete(id);
    window.location.reload();
}

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
            <CardContent className="pt-2 flex flex-col">
                <p>{expanded || !isLong ? summary : summary.slice(0, 100) + '...'}</p>
                <div className="flex justify-between">
                    {isLong && (
                        <Button variant="link" size="sm" className="p-0 mt-1 text-white" onClick={() => setExpanded(!expanded)}>
                            {expanded ? 'Show less' : 'Show more'}
                        </Button>
                    )}
                    <Button onClick={()=>deleteAssignment(assignment.id)} className="bg-white hover:bg-gray-300 cursor-pointer px-2" >❌</Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface PrepRecord extends RecordModel {
    title: string;
    feedback: string;
    problems: { title: string; question: string; solution: string[] }[];
}

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
                <Button onClick={()=>deletePrep(prep.id)} variant="link" className="cursor-pointer px-0" >Delete Plan</Button>
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
        } catch (e) {
            console.log(e.message);
        }
    }

    if (assignments === undefined && !pending) fetchAssignment();

    return (
        <>
            {showAddAssignment ? <div onClick={() => setShowAddAssignment(false)} className="absolute left-0 top-0 w-full h-full z-[15] bg-background/50 backdrop-blur-md "></div> : <></>}
            <Upload isShown={showAddAssignment}></Upload>
            <div className="container m-8 relative z-10 min-h-[90vh]">
                <Card className="bg-card/50 backdrop-blur-sm border-muted min-h-[80%]">
                    <CardContent className="pt-4 mx-2 md:mx-8">
                        <div className="md:flex justify-between">
                            <div className="my-4">
                                <h1 className="text-5xl font-bold leading-tight">Exam Buster</h1>
                                <hr className="mt-2"></hr>
                            </div>
                            <Popover>
                                <PopoverTrigger>
                                    <div className="flex items-center">
                                        <CircleUserIcon className="mr-2" size={20}></CircleUserIcon>
                                        {pb.authStore.record.email}
                                        <ChevronDown className="ml-2" size={20}></ChevronDown>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <span>Welcome {pb.authStore.record.email.split("@")[0]},</span>
                                    <Button onClick={() => { pb.authStore.clear(); window.location.reload() }} className="mt-4">Log out</Button>
                                </PopoverContent>
                            </Popover>
                            <hr className="md:hidden mt-2"></hr>
                        </div>
                        <section>
                            <p className="max-w-[800px] mt-4 md:mt-0">
                                Let's help you prepare for your exam. Just upload past assignments from the semester and get tailored feedback along with a study plan and sample problems to solve. Supercharged with <a className="hover:underline text-primary" href="https://cerebras.ai">Cerebras inference</a>.
                            </p>
                            <hr className="mt-4"></hr>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold my-4 leading-tight">Assignments</h2>
                            <div className="flex gap-8 max-w-full overflow-x-auto">
                                {assignments?.length ? assignments?.map((assignment) => (
                                    <AssignmentCard assignment={assignment} key={assignment.id} />
                                )) : 'Looks like you dont have any assignments yet!'}
                            </div>
                            <Button className="mt-4" onClick={() => setShowAddAssignment(true)}>Upload Assignment</Button>
                            <hr className="mt-4"></hr>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold my-4 leading-tight">Study Plans</h2>
                            <div className="flex flex-col gap-4 w-full">
                                {preps?.length ? preps?.map((prep) => (
                                    <PrepCard prep={prep} key={prep.id} />
                                )) : 'Looks like you don\'t have any study plans yet!'}
                            </div>
                            <Button className="mt-4" onClick={() => createStudyPlan()}>Create Study Plan</Button>
                            <hr className="mt-4"></hr>
                        </section>
                    </CardContent>
                </Card>
                <Card className="mt-4">
                    <CardContent className="flex justify-between p-4">
                        <span className="ml-1">Created by <Button className="px-0 text-md cursor-pointer" variant="link" onClick={()=>window.location.replace("https://danielmorgan.xyz")}>Daniel Morgan</Button>.</span>
                        <GithubIcon className="mt-1 hover:text-primary cursor-pointer" onClick={()=>window.location.replace("https://github.com/Dmrgn/Exam-Buster")}></GithubIcon>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default App;
