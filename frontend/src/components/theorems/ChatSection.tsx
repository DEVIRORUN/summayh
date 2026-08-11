"use client";

import { OrderChatThread, type ChatMessage } from "@/components/theorems/OrderChatThread";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    const [isLoadin, setIsLaoding] = useState<boolean>(true);

    useEffect(() => {
        async function loadMessages(id: string) {
            const msgRes = await fetch(`/api/messages/${id}`);
            if (!msgRes.ok) return;
            const msgJson = await msgRes.json();
            console.log("Message", msgJson);

            const mapped: ChatMessage[] = msgJson.data.data.map((m: any) => ({
                id: m.id,
                senderId: m.senderId,
                senderAvatar: "",
                text: m.content,
                timestamp: new Date(m.createdAt).toLocaleTimeString(),
                isOwn: m.senderId === currentUserId,
            }))

            setMessages(mapped.reverse())

            // call mark as seen
            fetch(`/api/messages/${id}/seen`, { method: "PATCH" }).catch((err) => 
                console.error("Failed to mark as seen: ", err)
            );
        }

        async function init() {
            if (initialConversationId) {
                // If there's a convo just load it, no res needed
                await loadMessages(initialConversationId);
                return;
            }

            if (!otherUserId) return;

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
        }

        init();
    }, [otherUserId, initialConversationId, currentUserId]);

    useEffect(() => {
        if (!conversationId) return;
        const filterString = `conversationId=${conversationId}`;
        console.log("FILTER STRING:", filterString);

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Message",
                    // filter: filterString
                },
                (payload) => {
                    console.log("REALTIME PAYLOAD:", payload);
                    const m = payload.new;

                    if (m.conversationId !== conversationId) return;
                    if (m.senderId === currentUserId) return;

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: m.id,
                            senderId: m.senderId,
                            senderAvatar: "",
                            text: m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" }),
                            isOwn: false,
                        }
                    ]);

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
        if (!conversationId) return;

        const tempId = `temp=${Date.now()}`;
        const optimisticMessage: ChatMessage =  {
            id: tempId,
            senderId: currentUserId,
            senderAvatar: "",
            text,
            timestamp: new Date().toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" }),
            isOwn: true,
        }

        setMessages((prev) => [...prev, optimisticMessage]); // Immediate show

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
                                timestamp: new Date(newMessage.createdAt).toLocaleTimeString(),
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
        <div className={cn("w-full min-w-0 border border-border rounded-md h-96 flex flex-col", messagePage ? "h-full" : "")}>
            <button onClick={() => router.back()} className="p-2 cursor-pointer"><ArrowLeft /></button>    
            <OrderChatThread messages={messages} onSend={handleSendMessage}/>
        </div>
    )
}