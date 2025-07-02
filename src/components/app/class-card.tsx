import ChatMessenger from '@/components/app/chat-messenger';
import { AppSidebar, type Class } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { pb } from '@/lib/db';
import { useEffect, useState } from "react";
import { Card, CardHeader } from '../ui/card';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Clipboard } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface Chat {
    id: string;
    userId: string;
    messages: any[]; // Use a more specific type if available
    name: string;
    created: string;
    updated: string;
}

export default function ClassCard({ currentClass, refreshClasses }: { currentClass: Class, refreshClasses: () => Promise<void> }) {

    const [isEditingName, setIsEditingName] = useState(false);
    const [newClassName, setNewClassName] = useState("");

    const { classId } = useParams();

    const handleNameClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewClassName(e.target.value);
    };

    const handleNameBlur = async () => {
        setIsEditingName(false);
        if (currentClass && newClassName !== currentClass.name && newClassName.trim() !== "") {
            try {
                await pb.collection('classes').update(currentClass.id, { name: newClassName });
                await refreshClasses();
            } catch (err) {
                console.error("Error updating chat name:", err);
                setNewClassName(currentClass.name);
            }
        }
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        < Card className="bg-card/50 backdrop-blur-sm border-muted w-full" >
            {/* Header */}
            <CardHeader className="flex items-center justify-between px-4 pb-4 border-b" >
                <div className="flex items-center space-x-3">
                    <Avatar className='p-1 rounded-md' style={{ backgroundColor: currentClass.color }}>
                        <AvatarFallback>
                            <Clipboard></Clipboard>
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        {isEditingName ? (
                        <Input
                            value={newClassName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyPress={handleNameKeyPress}
                            autoFocus
                            className="h-6 text-base"
                        />
                        ) : (
                        <h3 onClick={handleNameClick} className="cursor-pointer font-semibold">
                            {currentClass ? currentClass.name : "Loading..."}
                        </h3>
                                    )}
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
            </CardHeader >
        </Card >
    );
}