import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Upload from "@/components/upload"
import "../../styles/index.css";
import { useState } from "react";
import { pb } from "@/lib/db";
import type { RecordModel } from "pocketbase";
import { FileTextIcon } from "lucide-react";

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
export function App() {

    if (!localStorage.getItem("pocketbase_auth")) window.location.replace("/login");

    const currentUserId = pb.authStore.record.id;
    const [assignments, setAssignments] = useState<RecordModel[]>();
    const [pending, setPending] = useState<boolean>(false);
    const [showAddAssignment, setShowAddAssignment] = useState<boolean>(false);

    async function fetchAssignment(page = 1, perPage = 50) {
        setPending(true);
        const { items, totalItems } = await pb
            .collection('assignments')
            .getList(page, perPage, {
                // simple string filter:
                filter: `userId = "${currentUserId}"`,
                // optional sorting, e.g. most recent first:
                sort: '-created',
            });
        setAssignments(items);
        setPending(false);
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
                            <div className="flex gap-8 max-w-full overflow-x-auto min-h-32">
                                {assignments?.map((assignment) => (
                                    <AssignmentCard assignment={assignment} key={assignment.id} />
                                )) ?? 'Looks like you dont have any assignments yet!'}
                            </div>
                            <Button className="mt-4" onClick={() => setShowAddAssignment(true)}>Upload Assignment</Button>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default App;
