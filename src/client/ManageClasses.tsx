
import type React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader } from "@/components/ui/card"
import { Send, Paperclip, X, MoreHorizontal, BotIcon, Badge } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { pb } from "@/lib/db"
import { useEffect, useState } from "react"
import type { Class } from "@/components/app/app-sidebar"
import { useParams } from "react-router-dom"
import ClassCard from "@/components/app/class-card"

export default function ClassesScreen() {
    const user = pb.authStore.record ? {
        id: pb.authStore.record.id || '',
        name: pb.authStore.record.name || 'User',
        email: pb.authStore.record.email || '',
        avatar: pb.authStore.record.avatar || '',
    } : null;

    const { classId } = useParams();

    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [activeClass, setActiveClass] = useState<Class>({
        name: "",
        color: "#000000",
        userId: "",
        id: ""
    });

    async function refreshClasses() {
        pb.autoCancellation(false);
        await pb.collection('classes').getList(1, 20, { filter: `userId = "${user.id}"`, sort: '-created' }).then((classes) => {
            setAllClasses(classes.items as any as Class[]);
            const classRecord = classes.items.find(x => x.id === classId);
            setActiveClass({
                name: classRecord.name,
                color: classRecord.color,
                userId: classRecord.userId,
                id: classRecord.id,
            });
        });
        pb.autoCancellation(true);
    }

    useEffect(() => {
        refreshClasses();
    }, [classId])

    return <div className="min-h-[80%] max-w-[1200px] w-[97%]">
        {allClasses.map((currentClass, index) => (
            <ClassCard key={index} currentClass={currentClass} refreshClasses={refreshClasses}></ClassCard>
        ))}
    </div>
}
