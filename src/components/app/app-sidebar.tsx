"use client"
import React, { useEffect, useState } from 'react'
import { Home, ClipboardList, Bot, MessageSquare } from 'lucide-react'
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

export function AppSidebar() {
    const user = pb.authStore.record
    const [chats, setChats] = useState<Array<{ id: string }>>([])

    useEffect(() => {
        console.log(user.id, chats);
        if (!user.id) return
        pb.collection('chats')
            .getList(1, 20, { filter: `userId = "${user.id}"`, sort: '-created' })
            .then(res => {
                setChats(res.items.map(item => ({ id: item.id })));
                console.log(res);
            })
            .catch(console.error);
    }, [user.id])


    const navItems = [
        { title: 'Dashboard', url: '/', icon: Home },
        { title: 'Exam Buster', url: '/prep', icon: ClipboardList },
        { title: 'AI Chat', url: '/chat', icon: Bot },
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
                    <SidebarGroupLabel>Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {chats.length > 0 ? (
                            chats.map(chat => (
                                <SidebarMenuItem className='list-none' key={chat.id} onClick={()=>window.location.replace(`/chat?chatId=${chat.id}`)}>
                                    <SidebarMenuButton tooltip={chat.id}>
                                        <MessageSquare />
                                        <span>{chat.id.slice(0, 8)}</span>
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