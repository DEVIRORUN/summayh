"use client";

import { OrderChatThread, type ChatMessage } from "@/components/theorems/OrderChatThread";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ChatSectionProps {
    messagePage: boolean;
    otherUserId?: string;
    conversationId?: string;
    currentUserId: string;
}

export function ChatSection({ messagePage, otherUserId, conversationId: initialConversationId, currentUserId }: ChatSectionProps) {
    const router = useRouter();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
    const [isLoading, setIsLoading] = useState(true);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        async function loadMessages(id: string) {
            try {

                const msgRes = await fetch(`/api/messages/${id}`);
                if (!msgRes.ok) return;
                const msgJson = await msgRes.json();
                
                const rawData = msgJson.data?.data || msgJson.data || [];
    
                const mapped: ChatMessage[] = rawData.map((m: any) => ({
                    id: m.id,
                    senderId: m.senderId,
                    senderAvatar: "",
                    text: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Africa/Lagos",
                    }),
                    isOwn: m.senderId === currentUserId,
                }))
    
                setMessages(mapped.reverse())
                setTimeout(scrollToBottom, 50);
    
                // call mark as seen
                fetch(`/api/messages/${id}/seen`, { method: "PATCH" })
            } catch (err) {
                console.error("Failed to laod messages:", err);
            } finally {
                setIsLoading(false)
            }
        }

        async function init() {
            if (initialConversationId) {
                await loadMessages(initialConversationId);
                return;
            }

            if (!otherUserId || otherUserId === currentUserId) {
                setIsLoading(false);
                return;
            };

            try {
                const res = await fetch("/api/messages/conversation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ otherUserId })
                });
        
                if(!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    console.error("Failed to get/create conversation:", err);
                    return;
                }
        
                const { data } = await res.json();
                setConversationId(data.id);
                await loadMessages(data.id);
            } catch (err) {
                console.error("Failed to initialize conversation:", err);
            } finally {
                setIsLoading(false);
            }
        }

        init();
    }, [otherUserId, initialConversationId, currentUserId]);

    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Message",
                    filter: `conversationId=eq.${conversationId}`
                },
                (payload) => {
                    console.log("REALTIME PAYLOAD:", payload);
                    const m = payload.new;
                    if (m.senderId === currentUserId) return;

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: m.id,
                            senderId: m.senderId,
                            senderAvatar: "",
                            text: m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString("en-NG", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Africa/Lagos",
                            }),
                            isOwn: false,
                        }
                    ]);

                    setTimeout(scrollToBottom, 50);
                    fetch(`/api/messages/${conversationId}/seen`, { method: "PATCH" }).catch(() => {});
                }
            )
            .subscribe((status) => {
                console.log("REALTIME PAYLOAD:", status);
            });
        
        return () => {
            console.log("[SUPABASE REALTIME]: WORKED")
            supabase.removeChannel(channel);
        }
    }, [conversationId, currentUserId]);


    async function handleSendMessage(text: string) {
        if (!conversationId || !text.trim()) return;

        const tempId = `temp=${Date.now()}`;
        const optimisticMessage: ChatMessage =  {
            id: tempId,
            senderId: currentUserId,
            senderAvatar: "",
            text,
            timestamp: new Date().toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Africa/Lagos",
            }),
            isOwn: true,
        }

        setMessages((prev) => [...prev, optimisticMessage]); // Immediate show
        setTimeout(scrollToBottom, 50);

        try {
            const res = await fetch(`/api/messages/${conversationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text })
            });

            if (!res.ok) {
                // Roll back
                setMessages((prev) => prev.filter((m) => m.id !== tempId));
                return;
            };

            const { data: newMessage } = await res.json();
            
            setMessages((prev) =>
                prev.map((m) => 
                    m.id === tempId
                        ?   {
                                id: newMessage.id,
                                senderId: newMessage.senderId,
                                senderAvatar: "",
                                text: newMessage.content,
                                timestamp: new Date(newMessage.createdAt).toLocaleTimeString("en-NG", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Africa/Lagos",
                                }),
                                isOwn: true,
                            }
                        : m
                    )
            );
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== tempId))
            console.error("Failed to send message:", err);
        }
    }

    return (
        <div className={cn(
            "w-full min-w-0 border border-border rounded-lg flex flex-col bg-card overflow-hidden", 
            messagePage ? "h-[calc(100vh-100px)] max-h-full" : "h-[500px]")}>
            <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20 shrink-0">
                <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground cursor-pointer" aria-label="back"><ArrowLeft className="w-5 h-5" /></button> 
                <span className="text-sm font-semibold">Conversation</span>   
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm">Laoding thread...</span>
                    </div>
                ) : (
                    <OrderChatThread messages={messages} onSend={handleSendMessage}/>
                )}
            </div>
        </div>
    )
}