"use client"
import React, { useEffect, useState } from 'react'
import { Home, ClipboardList, Bot, MessageSquare, Plus, Trash } from 'lucide-react'
import { pb } from '@/lib/db'
import { NavMain } from '@/components/app/nav-main'
import { NavUser } from '@/components/app/nav-user'
import { TeamSwitcher } from '@/components/app/team-switcher'
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Button } from '../ui/button'

export function AppSidebar() {
    const user = pb.authStore.record ? {
        id: pb.authStore.record.id || '',
        name: pb.authStore.record.name || 'User',
        email: pb.authStore.record.email || '',
        avatar: pb.authStore.record.avatar || '',
    } : null;
    const [chats, setChats] = useState<Array<{ id: string, name: string }>>([])

    useEffect(() => {
        if (!user?.id) return
        pb.collection('chats')
            .getList(1, 20, { filter: `userId = "${user.id}"`, sort: '-created' })
            .then(res => {
                setChats(res.items.map(item => ({ id: item.id, name: item.name })));
            })
            .catch(console.error);
    }, [user?.id])


    const handleCreateChat = async () => {
        if (!user?.id) return;
        try {
            const newChat = await pb.collection('chats').create({
                userId: user.id,
                name: 'New Chat',
            });
            setChats(prevChats => [...prevChats, { id: newChat.id, name: newChat.name }]);
            window.location.replace(`${window.location.origin}/chat?chatId=${newChat.id}`);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        if (!user?.id) return;
        try {
            setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
            await pb.collection('chats').delete(chatId);
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    function navigateToChat(id: string) {
        if (chats.some(x => x.id === id))
            window.location.replace(`/chat?chatId=${id}`);
    }

    const navItems = [
        { title: 'Dashboard', url: '/', icon: Home },
        { title: 'Exam Buster', url: '/prep', icon: ClipboardList },
        { title: 'Henry\'s DMs', url: '/chat', icon: Bot },
    ]

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <TeamSwitcher teams={[{
                    name: "test",
                    logo: "div",
                    plan: "Free Tier"
                }]} />
            </SidebarHeader>

            <SidebarContent className='overflow-hidden'>
                <NavMain items={navItems} />
                <SidebarSeparator />
                <SidebarGroup>
                    <SidebarGroupLabel>DMs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton onClick={handleCreateChat}>
                            <Plus></Plus>
                            New Chat
                        </SidebarMenuButton>
                        {chats.length > 0 ? (
                            chats.map(chat => (
                                <SidebarMenuItem className='list-none' key={chat.id} onClick={() => navigateToChat(chat.id)}>
                                    <SidebarMenuButton tooltip={chat.id}>
                                        <MessageSquare />
                                        <span>{chat.name}</span>
                                        <Button onClick={() => handleDeleteChat(chat.id)} className="ml-auto hover:bg-muted" variant='ghost'>
                                            <Trash></Trash>
                                        </Button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                        ) : (
                            <div className="px-2 py-1 text-sm text-muted-foreground">No chats yet</div>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar >
    )
}
