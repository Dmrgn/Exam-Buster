"use client"

import type React from "react"

import { pb } from '@/lib/db';
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Paperclip, X, MoreHorizontal, BotIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import 'katex/dist/katex.min.css'
import { Badge } from "../ui/badge";
import ChatInput from "./chat-input";
import { useParams } from "react-router-dom";

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface Chat {
    id: string;
    userId: string;
    messages: Message[];
    created: DateTime;
    updated: DateTime;
}

const DESMOS_API_KEY = "dcb31709b452b1cf9dc26972add0fda6"; // this is a demo key, so putting it here is fine

export default function ChatMessenger() {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const currentUser = pb.authStore.record;
    const userId = currentUser.id;

    const [quotedText, setQuotedText] = useState<string>("");
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [chats, setChats] = useState<Chat[] | null>(null);

    const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
    const [chatsLoading, setChatsLoading] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    const params = useParams();

    // delete or reference a message
    const handleDelete = async (idx: number) => {
        setMessages(messages.filter((_, i) => i !== idx));
        await pb.collection('chats').update(chatId, { messages: messages.filter((_, i) => i !== idx) });
        await fetchMessages(chatId);
    };
    const handleReference = (idx: number) => {
        if (!messages) return;
        const msg = messages[idx];
        // quote each line
        const quote = msg.content
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n")
            + "\n\n";
        setQuotedText((prev) => quote + prev);
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }, [messages]);

    useEffect(() => {
        setChatId(params.chatId);
        if (chats === null && !chatsLoading) {
            setChatsLoading(true);
            fetchChats().then(() => {
                setChatsLoading(false);
            });
        }
    }, [params])

    useEffect(() => {
        if (chatId === null) return;
        setMessagesLoading(true);
        fetchMessages(chatId).then(() => {
            setMessagesLoading(false);
        });
    }, [chatId]);

    // Fetch messages for existing chat
    async function fetchMessages(id: string) {
        const chat = await pb.collection("chats").getOne(id);
        setMessages(chat.messages);
    }
    async function fetchChats() {
        pb.autoCancellation(false);
        let chats = await pb.collection("chats").getList(1, 20, { filter: `userId = "${userId}"`, sort: '-created' });
        // force create a chat
        if (chats.items.length === 0) {
            await pb.collection('chats').create({ userId, messages: [], name: "Empty Chat", class: params.classId });
            chats = await pb.collection("chats").getList(1, 20, { filter: `userId = "${userId}"`, sort: '-created' });
        }
        pb.autoCancellation(true);
        setChats(chats.items as any as Chat[]);
    }

    // Ensure a chat exists client-side, then send a user message to the server
    async function sendMessage(input: string, files: FileList | undefined): Promise<void> {
        setLoading(true);
        if (messages && messages.length > 0)
            setMessages([...messages, { role: 'user' as const, content: input }]);
        // check for uploaded files
        let fileNames = [];
        if (files !== undefined && files.length > 0) {
            fileNames = (await pb.collection('chats').update(chatId, { files: Array.from(files) })).files;
        }
        // Build payload for /api/chat: always includes chatId
        const payload: any = { userId, chatId: chatId, content: input, files: fileNames };
        // Send to server for AI response and persistence
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        setLoading(false);

        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage: Message = { role: 'assistant', content: '' };
        setMessages(prev => [...(prev || []), assistantMessage]);

        let done = false;
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            const chunk = decoder.decode(value, { stream: true });
            const events = chunk.split('\n').filter(Boolean);

            for (const event of events) {
                try {
                    const data = JSON.parse(event);
                    if (data.type === 'token') {
                        assistantMessage.content += data.content;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { ...assistantMessage };
                            return newMessages;
                        });
                    } else if (data.type === 'tool_call') {
                        const toolCallMessage: Message = {
                            role: 'system',
                            content: `Using tool: ${data.name} with arguments: ${JSON.stringify(data.args)}`
                        };
                        setMessages(prev => [...(prev.slice(0, -1)), toolCallMessage, assistantMessage]);
                    } else if (data.type === 'tool_response') {
                        // Optionally display tool responses for debugging or clarity
                    } else if (data.type === 'error') {
                        console.error('Streaming error:', data.error);
                        assistantMessage.content = `An error occurred: ${data.error}`;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { ...assistantMessage };
                            return newMessages;
                        });
                        return;
                    }
                } catch (e) {
                    // might not be a json object
                }
            }
        }
        await fetchMessages(chatId);
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-muted min-h-[80%] max-w-[1200px] w-[97%]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarFallback>
                            <BotIcon></BotIcon>
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">Delsilon</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="items-center space-x-3 sm:flex hidden">
                    <Badge variant="outline">Web Access</Badge>
                    <Badge variant="outline">Graphing</Badge>
                    <Badge variant="outline">Image Generation</Badge>
                    <Badge variant="outline">Image Recognition</Badge>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 max-h-[70vh] min-h-[70vh] overflow-hidden" ref={scrollAreaRef}>
                <div className="flex flex-col space-y-4">
                    {(messages === null || messages?.length === 0) && (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Start a conversation by sending a message or image/pdf!</p>
                        </div>
                    )}

                    {messages?.map((message, index) => {
                        // summary: first line or truncated
                        const messageContent = message.content.trim();
                        let preview = "";
                        if (messageContent.includes("</think>")) {
                            const responseText = messageContent.slice(messageContent.indexOf("</think>") + "</think> ".length);
                            preview = responseText.length > 50 ? responseText.slice(0, 50) + "..." : responseText
                        } else {
                            const responseText = messageContent.slice(messageContent.indexOf("<think>") + "<think> ".length);
                            preview = responseText.length > 50 ? responseText.slice(0, 50) + "..." : responseText
                        }
                        if (message.role === 'system') { // this is for tool calls 
                            return (
                                <div key={index} className="flex justify-center">
                                    <div className="text-sm text-muted bg-secondary rounded-lg px-3 py-1">
                                        {messageContent}
                                    </div>
                                </div>
                            )
                        }
                        if (preview.trim() === "") return <></>
                        return (
                            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start space-x-2`}>
                                <div
                                    className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2`}
                                >
                                    <div className="flex flex-col">
                                        <Avatar className="w-9 h-9">
                                            <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                                        </Avatar>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="p-0">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={message.role === "user" ? "end" : "start"}>
                                                <DropdownMenuItem onSelect={() => handleReference(index)}>
                                                    Reference
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDelete(index)}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div
                                        className={`rounded-lg px-3 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground ml-2" : "bg-muted mr-2"}`}
                                    >
                                        {message.content.length >= 200 && <Accordion type="single" collapsible defaultValue={index >= messages.length - 2 ? `message-${index}` : ''} >
                                            <AccordionItem key={index} value={`message-${index}`} >
                                                <AccordionTrigger >
                                                    {preview}
                                                </AccordionTrigger>
                                                <AccordionContent >
                                                    <RichMessageText message={message} />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>}
                                        {message.content.length < 200 &&
                                            <RichMessageText message={message} />
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}

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

            {/* Input Area */}
            <ChatInput sendMessage={sendMessage} quotedText={quotedText} setQuotedText={setQuotedText} loading={loading}></ChatInput>
        </Card>
    )
}
function RichMessageText({ message }: { message: Message }) {
    const thinkRegex = /<think>(.*?)<\/think>/s;
    const incompleteThinkRegex = /<think>(.*)/s;

    let contentToRender = message.content;
    let thinkContent = '';
    let hasThinkBlock = false;

    const thinkMatch = message.content.match(thinkRegex);
    if (thinkMatch) {
        hasThinkBlock = true;
        thinkContent = thinkMatch[1];
        contentToRender = message.content.replace(thinkRegex, '');
    } else {
        const incompleteThinkMatch = message.content.match(incompleteThinkRegex);
        if (incompleteThinkMatch) {
            hasThinkBlock = true;
            thinkContent = incompleteThinkMatch[1];
            contentToRender = message.content.replace(incompleteThinkRegex, '');
        }
    }

    return (
        <div className="max-w-[70vw] overflow-x-auto prose prose-invert">
            {hasThinkBlock && (
                <ThinkingBox content={thinkContent} />
            )}
            <ReactMarkdown
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-desmos/.exec(className || '');
                        if (match) {
                            const textContent = Array.isArray(children)
                                ? children.map(child => String(child).trim()).join('\n')
                                : String(children).trim();
                            const expressions = textContent.split("\n").filter(Boolean);

                            const iframeContent = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <script src="https://www.desmos.com/api/v1.7/calculator.js?apiKey=${DESMOS_API_KEY}"></script>
                                </head>
                                <body>
                                    <div id="calculator" style="width: 95vw; height: 95vh;"></div>
                                    <script>
                                        var elt = document.getElementById('calculator');
                                        var calculator = Desmos.GraphingCalculator(elt);
                                        calculator.setExpressions([${expressions.map((x, i) => (JSON.stringify({ id: i, latex: x }))).join(", ")}]);
                                    </script>
                                </body>
                                </html> 
                            `;

                            const iframeRef = useRef(null);

                            useEffect(() => {
                                if (iframeRef.current) {
                                    iframeRef.current.srcdoc = iframeContent;
                                }
                            }, []);

                            return (
                                <iframe ref={iframeRef} className="max-w-[70vw] w-full" width="600" height="600" />
                            )
                        }
                        return <code className={className} {...props}>{children}</code>
                    }
                }}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {contentToRender}
            </ReactMarkdown>
        </div>
    );
}

function ThinkingBox({ content }: { content: string }) {
    const preview = content.trim().split("\n")[0];
    return (
        <Accordion type="single" collapsible className="w-full p-0 m-0">
            <AccordionItem value="thinking-box" className="p-0 m-0">
                <AccordionTrigger className="text-sm text-muted-foreground p-0 m-0">
                    Thinking Process: {preview.length > 50 ? preview.slice(0, 50) + "..." : preview}
                </AccordionTrigger>
                <AccordionContent className="p-0 m-0">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {content}
                    </ReactMarkdown>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
