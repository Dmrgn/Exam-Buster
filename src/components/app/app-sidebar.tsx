"use client"
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, } from 'react-router-dom';
import { Home, ClipboardList, Bot, MessageSquare, Plus, Trash } from 'lucide-react'
import { pb } from '@/lib/db'
import { NavMain } from '@/components/app/nav-main'
import { NavUser } from '@/components/app/nav-user'
import { ClassSwitcher } from '@/components/app/class-switcher'
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

export type Chat = { id: string, name: string, topic: string };
export type Class = { id: string, color: string, name: string, userId: string };

export function AppSidebar() {
    const user = pb.authStore.record ? {
        id: pb.authStore.record.id || '',
        name: pb.authStore.record.name || 'User',
        email: pb.authStore.record.email || '',
        avatar: pb.authStore.record.avatar || '',
    } : null;
    const [chats, setChats] = useState<Array<Chat>>([]);
    const [allClasses, setAllClasses] = useState<Array<Class>>([]);
    const [currentClass, setCurrentClass] = useState<string>(null);
    const [navItems, setNavItems] = useState([
        { title: 'Dashboard', url: '/', icon: Home },
        { title: 'Exam Buster', url: '/prep', icon: ClipboardList },
    ]);

    const navigate = useNavigate();
    const queryParams = useParams();
    const classQueryParam = queryParams.classId;
    const chatQueryParam = queryParams.chatId;

    useEffect(() => {
        if (!user?.id) return
        pb.autoCancellation(false);
        // get list of classes
        pb.collection('classes').getList(1, 20, { filter: `userId = "${user.id}"`, sort: '-created' }).then((classes) => {
            setAllClasses(classes.items as any as Class[]);
        })

        pb.collection('classes').getOne(classQueryParam).then((classRecord) => {
            setCurrentClass(classRecord.id);
            setNavItems([
                { title: 'Dashboard', url: '/', icon: Home },
                { title: 'Exam Buster', url: `/class/${classRecord.id}/prep`, icon: ClipboardList },
            ]);
            pb.collection('chats')
                .getList(1, 20, { filter: `userId = "${user.id}" && class = "${classRecord.id}"`, sort: '-created' })
                .then(res => {
                    setChats(res.items.map(item => ({ id: item.id, name: item.name, topic: item.topic })));
                })
                .catch(console.error);
        }).catch(e => {
            // get all classes for this user and navigate to the first one
            pb.collection('classes').getList(1, 1, { filter: `userId = "${user.id}"`, sort: '-created' }).then(classes => {
                if (classes.items.length === 0) {
                    // create default class
                    pb.collection('classes').create({
                        name: "Default Class",
                        color: "#2691d9", // app default color,
                        userId: user.id,
                    }).then((classRecord) => {
                        navigate({ pathname: `/class/${classRecord.id}` });
                    });
                } else {
                    navigate({ pathname: `/class/${classes.items[0].id}` });
                }
            });
        });

        pb.autoCancellation(true);
    }, [queryParams]);

    const handleCreateChat = async () => {
        if (!user?.id) return;
        try {
            const newChat = await pb.collection('chats').create({
                userId: user.id,
                name: 'Empty Chat',
                class: currentClass
            });
            setChats(prevChats => [...prevChats, { id: newChat.id, name: newChat.name, topic: newChat.topic }]);
            navigate({ pathname: `/class/${currentClass}/chat/${newChat.id}` });
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
            navigate({ pathname: `/class/${currentClass}/chat/${id}` });
    }

    /**
     * @returns A Map<string, Chat[]> which maps a topic name to an array of chats in that topic.
     */
    function getChatsByTopic() {
        const chatsWithTopic = chats.filter(x => x.topic !== "");
        const topics = new Set<string>(chatsWithTopic.map(x => x.topic));
        const topicsMap = new Map<string, Chat[]>();
        topics.forEach(x => topicsMap.set(x, []));
        chatsWithTopic.forEach(x => topicsMap.get(x.topic).push(x));
        return topicsMap;
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <ClassSwitcher />
            </SidebarHeader>

            <SidebarContent className='overflow-hidden'>
                <NavMain items={navItems} />
                <SidebarSeparator />
                <SidebarGroup>
                    <SidebarGroupLabel>DMs</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenuButton onClick={handleCreateChat}>
                            <Plus></Plus>
                            Start Chat
                        </SidebarMenuButton>

                        {/* Chats without topics */}
                        {chats.length > 0 && (
                            chats.filter(x => x.topic === "")
                                .map(chat => (
                                    <SidebarMenuItem className='list-none' key={chat.id} onClick={() => navigateToChat(chat.id)}>
                                        <SidebarMenuButton tooltip={chat.id}>
                                            <MessageSquare />
                                            <span>{chat.name}</span>
                                            <div onClick={() => handleDeleteChat(chat.id)} className="ml-auto hover:bg-muted">
                                                <Trash className='w-4'></Trash>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                        )}

                        {/* Chats with topics */}
                        {chats.length > 0 && (
                            Array.from(getChatsByTopic().keys())
                                .map((topic, index) => (
                                    <div key={index}>
                                        <SidebarGroupLabel>{topic}</SidebarGroupLabel>
                                        {Array.from(getChatsByTopic().get(topic).values()).map(chat =>
                                            <SidebarMenuItem className='list-none' key={chat.id} onClick={() => navigateToChat(chat.id)}>
                                                <SidebarMenuButton tooltip={chat.id}>
                                                    <MessageSquare />
                                                    <span>{chat.name}</span>
                                                    <div onClick={() => handleDeleteChat(chat.id)} className="ml-auto hover:bg-muted">
                                                        <Trash className='w-4'></Trash>
                                                    </div>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )}
                                    </div>
                                ))
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
