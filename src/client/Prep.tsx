import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button"
import UploadForm from "@/components/app/upload"
import "../../styles/index.css";
import { useState } from "react";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { FileTextIcon, CircleUserIcon, ChevronDown, GithubIcon } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ClipboardListIcon } from "lucide-react";
import { MathJaxContext, MathJax } from "better-react-mathjax";

import { AssignmentCard } from "@/components/app/assignment-card";
import { PrepCard, type PrepRecord } from "@/components/app/prep-card";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function Prep() {
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
            <UploadForm isShown={showAddAssignment} />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/">Apps</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Exam Buster</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="flex flex-col items-center w-full my-auto z-10">
                        <Card className="bg-card/50 backdrop-blur-sm border-muted min-h-[80%] max-w-[1200px] w-[97%]">
                            <CardContent className="pt-4">
                                <MathJaxContext config={{
                                    loader: { load: ["input/asciimath"] }
                                }}>
                                    <div className="md:flex justify-between">
                                        <div className="my-4">
                                            <h1 className="text-5xl font-bold leading-tight">Exam Buster</h1>
                                            <hr className="mt-2"></hr>
                                        </div>
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
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-full overflow-x-auto">
                                            {assignments?.length ? assignments?.map((assignment) => (
                                                <AssignmentCard assignment={assignment} key={assignment.id} />
                                            )) : 'Looks like you dont have any assignments yet!'}
                                        </div>
                                        <Button className="mt-4" onClick={() => setShowAddAssignment(true)}>Upload Assignment</Button>
                                        <hr className="mt-4"></hr>
                                    </section>
                                    <section>
                                        <h2 className="text-2xl font-bold my-4 leading-tight">Study Plans</h2>
                                        <div className="grid md:grid-cols-2 gap-4 w-full">
                                            {preps?.length ? preps?.map((prep) => (
                                                <PrepCard prep={prep} key={prep.id} />
                                            )) : 'Looks like you don\'t have any study plans yet!'}
                                        </div>
                                        <div className="flex gap-4 mt-4">
                                            <Button onClick={() => createStudyPlan()}>Create Study Plan</Button>
                                        </div>
                                        <hr className="mt-4"></hr>
                                    </section>
                                </MathJaxContext>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}

export default Prep;
