import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { Send, Paperclip, X, MoreHorizontal, BotIcon, Badge, Plus } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { pb } from "@/lib/db"
import { useEffect, useState } from "react"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Class } from "@/components/app/app-sidebar"
import { useParams, useNavigate } from "react-router-dom"
import ClassCard from "@/components/app/class-card"
export default function ClassesScreen() {
    const user = pb.authStore.record ? {
        id: pb.authStore.record.id || '',
        name: pb.authStore.record.name || 'User',
        email: pb.authStore.record.email || '',
        avatar: pb.authStore.record.avatar || '',
    } : null;

    const { classId } = useParams();
    const navigate = useNavigate();

    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [activeClass, setActiveClass] = useState<Class>({
        name: "",
        color: "#000000",
        userId: "",
        id: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCreatingClass, setIsCreatingClass] = useState(false)
    const [className, setClassName] = useState('')
    const [classColor, setClassColor] = useState('#000000')

    async function refreshClasses() {
        setIsLoading(true);
        setError("");
        pb.autoCancellation(false);
        try {
            const classes = await pb.collection('classes').getList(1, 20, { 
                filter: `userId = "${user?.id}"`, 
                sort: '-created' 
            });
            const mappedClasses = classes.items.map(item => ({
                id: item.id,
                name: item.name,
                color: item.color,
                userId: item.userId
            }));
            setAllClasses(mappedClasses);
            if (classId) {
                const classRecord = mappedClasses.find(x => x.id === classId);
                if (classRecord) {
                    setActiveClass(classRecord);
                }
            }
        } catch (error) {
            console.error('Failed to refresh classes:', error);
            setError("Failed to load classes. Please try again.");
        } finally {
            setIsLoading(false);
            pb.autoCancellation(true);
        }
    }

    useEffect(() => {
        refreshClasses();
    }, [classId])

    const createClass = async () => {
        if (!user) return
        try {
            await pb.collection('classes').create({
                name: className,
                color: classColor,
                userId: user.id
            })
            setClassName('')
            setClassColor('#000000')
            setIsCreatingClass(false)
            await refreshClasses()
        } catch (error) {
            console.error('Class creation failed:', error)
            setError("Class creation failed. Please try again.")
        }
    }

    const deleteClass = async (classId: string) => {
        if (!user) return;
        try {
            await pb.collection('classes').delete(classId);
            await refreshClasses();
            if (activeClass.id === classId) {
                navigate("/");
            }
        } catch (error) {
            console.error('Class deletion failed:', error);
            setError("Failed to delete class. Please try again.");
        }
    }

    const updateClass = async (classId: string, updatedData: Partial<Class>) => {
        if (!user) return;
        try {
            await pb.collection('classes').update(classId, updatedData);
            await refreshClasses();
        } catch (error) {
            console.error('Class update failed:', error);
            setError("Failed to update class. Please try again.");
        }
    }

    if (error) {
        return (
            <div className="min-h-[80%] max-w-[1200px] w-[97%] flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-[80%] max-w-[1200px] w-[97%]">
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <>
                    <Sheet open={isCreatingClass} onOpenChange={setIsCreatingClass}>
                        <SheetTrigger asChild>
                            <Button className="fixed bottom-4 right-4 h-14 w-14 rounded-full" size="icon">
                                <Plus className="h-8 w-8" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <Card className="mb-4 rounded-none">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">Create New Class</h2>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="className">Class Name</Label>
                                            <Input 
                                                id="className" 
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                placeholder="Enter class name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="classColor">Class Color</Label>
                                            <Input 
                                                id="classColor" 
                                                type="color"
                                                value={classColor}
                                                onChange={(e) => setClassColor(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            onClick={createClass}
                                            disabled={!className.trim()}
                                        >
                                            Create Class
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        </SheetContent>
                    </Sheet>
                    <div className="flex flex-col gap-4">
                        {allClasses.map((currentClass, index) => (
                            <ClassCard 
                                key={index} 
                                currentClass={currentClass} 
                                refreshClasses={refreshClasses}
                                onDelete={() => deleteClass(currentClass.id)}
                                onUpdate={(updatedData) => updateClass(currentClass.id, updatedData)}
                            ></ClassCard>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
