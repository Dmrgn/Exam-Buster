import ChatMessenger from '@/components/app/chat-messenger';
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { pb } from '@/lib/db';
import { useEffect, useState } from "react";

interface Chat {
    id: string;
    userId: string;
    messages: any[]; // Use a more specific type if available
    name: string;
    created: string;
    updated: string;
}

export default function ChatScreen() {
    if (!localStorage.getItem("pocketbase_auth")) window.location.replace("/login");

    const [chat, setChat] = useState<Chat | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const chatId = queryParams.get("chatId");

        if (chatId) {
            pb.collection('chats').getOne(chatId).then((chatData: any) => {
                setChat(chatData);
                setNewChatName(chatData.name);
            }).catch(err => {
                console.error("Error fetching chat:", err);
                // Handle error, maybe redirect or show a message
            });
        }
    }, []); // Empty dependency array means this runs once on mount

    const handleNameClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewChatName(e.target.value);
    };

    const handleNameBlur = async () => {
        setIsEditingName(false);
        if (chat && newChatName !== chat.name && newChatName.trim() !== "") {
            try {
                await pb.collection('chats').update(chat.id, { name: newChatName });
                setChat({ ...chat, name: newChatName }); // Update local state
            } catch (err) {
                console.error("Error updating chat name:", err);
                // Revert to original name or show error
                setNewChatName(chat.name);
            }
        }
    };

    const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Trigger blur to save
        }
    };

    return (
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
                                    {isEditingName ? (
                                        <Input
                                            value={newChatName}
                                            onChange={handleNameChange}
                                            onBlur={handleNameBlur}
                                            onKeyPress={handleNameKeyPress}
                                            autoFocus
                                            className="h-6 text-base"
                                        />
                                    ) : (
                                        <BreadcrumbPage onClick={handleNameClick} className="cursor-pointer">
                                            {chat ? chat.name : "Loading..."}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-col items-center w-full my-auto z-10">
                    <ChatMessenger />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
