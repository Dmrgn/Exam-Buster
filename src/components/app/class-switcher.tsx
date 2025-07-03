"use client"

import { useEffect, useState } from "react";
import { ChevronsUpDown, Plus, Settings } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useNavigate, useParams } from "react-router-dom"
import { pb } from "@/lib/db";
import type { Class } from "./app-sidebar";

export function ClassSwitcher() {
    const user = pb.authStore.record ? {
        id: pb.authStore.record.id || '',
        name: pb.authStore.record.name || 'User',
        email: pb.authStore.record.email || '',
        avatar: pb.authStore.record.avatar || '',
    } : null;
    const { isMobile } = useSidebar()
    const { classId } = useParams();

    const navigate = useNavigate();

    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [activeClass, setActiveClass] = useState<Class>({
        name: "",
        color: "#000000",
        userId: "",
        id: "",
        textbook_status: "",
        textbook_job_id: ""
    });

    useEffect(() => {
        pb.autoCancellation(false);
        pb.collection('classes').getList(1, 20, { filter: `userId = "${user.id}"`, sort: '-created' }).then((classes) => {
            setAllClasses(classes.items as any as Class[]);
            const classRecord = classes.items.find(x => x.id === classId);
            setActiveClass(classRecord as any as Class);
        });
        pb.autoCancellation(true);
    }, [classId])

    async function changeClasses(classId: string) {
        setActiveClass(allClasses.find(x => x.id === classId) ?? activeClass);
        await navigate(`/class/${classId}`);
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground" style={{ backgroundColor: activeClass.color }}>
                                <div className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{activeClass.name}</span>
                                <span className="truncate text-xs">{activeClass.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Classes</DropdownMenuLabel>
                        {allClasses.map((classItem, index) => (
                            <DropdownMenuItem key={classItem.name} onClick={() => changeClasses(classItem.id)} className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <div className="size-4 shrink-0" style={{ backgroundColor: classItem.color }} />
                                </div>
                                {classItem.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/class/${activeClass.id}/manage`)} className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Settings className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">Manage classes</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
