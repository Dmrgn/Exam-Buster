"use client"

import type React from "react"

import { pb } from '@/lib/db';
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Paperclip, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import 'katex/dist/katex.min.css'

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Chat {
    id: string;
    userId: string;
    messages: Message[];
    created: DateTime;
    updated: DateTime;
}

export default function ChatMessenger() {
    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const currentUser = pb.authStore.record;
    const userId = currentUser.id;

    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [chats, setChats] = useState<Chat[] | null>(null);

    const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
    const [chatsLoading, setChatsLoading] = useState<boolean>(false);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        inputRef.current.focus();
    }, [messages]);

    if (chatId === null) {
        if (chats === null && !chatsLoading) {
            setChatsLoading(true);
            fetchChats().then(() => {
                setChatsLoading(false);
            });
        }
    }

    if (chatId !== null && messages === null && !messagesLoading) {
        setMessagesLoading(true);
        fetchMessages(chatId).then(() => {
            setMessagesLoading(false);
        });
    }

    // Fetch messages for existing chat
    async function fetchMessages(id: string) {
        const chat = await pb.collection("chats").getOne(id);
        setMessages(chat.messages);
    }

    async function fetchChats() {
        const chats = await pb.collection("chats").getList(1, 50);
        setChats(chats.items as any as Chat[]);
        setChatId(chats.items.length === 0 ? null : chats.items[0].id);
    }

    // Ensure a chat exists client-side, then send a user message to the server
    async function sendMessage(): Promise<string> {
        let localChatId = chatId;
        // Create a new chat record in PocketBase if none exists
        if (!localChatId) {
            const newChat = await pb.collection('chats').create({ userId, messages: [] });
            localChatId = newChat.id;
            setChatId(localChatId);
        }
        // check for uploaded files
        console.log(files);
        let fileNames = [];
        if (files !== undefined && files.length > 0) {
            fileNames = (await pb.collection('chats').update(chatId, {files: Array.from(files)})).files;
        }
        // Build payload for /api/chat: always includes chatId
        const payload: any = { userId, chatId: localChatId, content: input, files: fileNames };
        // Send to server for AI response and persistence
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        await res.json();
        // Return the chatId used
        return localChatId;
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            console.log(event.target.files);
            setFiles(event.target.files);
        }
    }

    const removeFiles = () => {
        setFiles(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Prevent empty sends
        if (!input.trim()) return;
        setLoading(true);
        // Create chat if needed and send message
        const usedChatId = await sendMessage();
        // Refresh messages from server
        await fetchMessages(usedChatId);
        setLoading(false);
        setInput('');
        removeFiles();
    }

    return (
        <Card className="flex flex-col max-w-[1200px] h-[90vh] w-[90vw] mx-2">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-[70vh] overflow-hidden" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages?.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Start a conversation by sending a message or image/pdf!</p>
                        </div>
                    )}

                    {messages?.map((message, index) => (
                        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                                    } items-start gap-2`}
                            >
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                                </Avatar>

                                <div
                                    className={`prose prose-invert rounded-lg px-3 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground ml-2" : "bg-muted mr-2"
                                        }`}
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {message.content}
                                    </ReactMarkdown>

                                    {/* Display attached images */}
                                    {/* {message.attachements
                                        ?.filter((attachment) => attachment.contentType?.startsWith("image/"))
                                        .map((attachment, index) => (
                                            <div key={`${message.id}-${index}`} className="mt-2">
                                                <img
                                                    src={attachment.url || "/placeholder.svg"}
                                                    alt={attachment.name ?? `Image ${index + 1}`}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-md object-cover max-w-full h-auto"
                                                />
                                            </div>
                                        ))} */}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div ref={endRef}></div>

                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-start space-x-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* File Preview */}
            {files && files.length > 0 && (
                <div className="px-4 py-2 border-t bg-muted/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">
                                {files.length} file{files.length > 1 ? "s" : ""} selected
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeFiles}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t">
                <form onSubmit={onSubmit} className="flex items-end space-x-2">
                    <div className="flex-1">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={loading}
                            className="resize-none min-h-[40px] max-h-[120px] overflow-y-auto max-w-full"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    if (input.trim() || files) {
                                        const form = e.currentTarget.form
                                        if (form) {
                                            const submitEvent = new Event("submit", { bubbles: true, cancelable: true })
                                            form.dispatchEvent(submitEvent)
                                        }
                                    }
                                }
                            }}
                            style={{
                                height: "auto",
                                minHeight: "40px",
                                maxHeight: "120px",
                            }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement
                                target.style.height = "auto"
                                target.style.height = Math.min(target.scrollHeight, 120) + "px"
                            }}
                        />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        <Paperclip className="w-4 h-4" />
                    </Button>

                    <Button type="submit" size="icon" disabled={loading || (!input.trim() && !files)}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    )
}
