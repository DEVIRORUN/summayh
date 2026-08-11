"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ConversationListItem } from "@/lib/message";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface ConversationListProps {
    conversations: ConversationListItem[];
    currentUserId: string;
}

export function ConversationList({ 
    conversations: initialConversations, 
    currentUserId 
}: ConversationListProps) {
    const [conversations, setConversations] = useState<ConversationListItem[]>(initialConversations);
    const router = useRouter();

    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase
            .channel(`user-conversations:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Message",
                },
                (payload) => {
                    const newMessage = payload.new;

                    setConversations((prev) => {
                        const idx = prev.findIndex((c) => c.id === newMessage.conversationId);

                        if (idx === -1) return prev;

                        const updatedConvo = {...prev[idx] };
                        updatedConvo.lastMessageAt = newMessage.createdAt;
                        updatedConvo.messages = [
                            {
                                id: newMessage.id,
                                content: newMessage.content,
                                senderId: newMessage.senderId,
                                seenAt: newMessage.senderId === currentUserId ? new Date() : null,
                                createdAt: newMessage.createdAt,
                            }
                        ];

                        const filtered = prev.filter((c) => c.id !== newMessage.conversationId);
                        return [updatedConvo, ...filtered]
                    });
                }
            )
            .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
    }, [currentUserId]);

    if(!conversations || conversations.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-muted-foreground">
                No conversations found.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1 w-full h-full min-h-0 overflow-y-auto pr-1">
            {conversations.map((convo) => {
                const isUserA = convo.userAId === currentUserId;
                const other = isUserA ? convo.userB : convo.userA;
                const lastMessage = convo?.messages[0];

                const isUnread = 
                    Boolean(lastMessage) && // If there's a new message
                    lastMessage?.senderId !== currentUserId && // And the sender is not me
                    !lastMessage?.seenAt; // show it as seenAt

                return (
                    <Link
                        key={convo.id}
                        href={`/dashboard/messages/${convo.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                        <Avatar className="w-11 h-11 shrink-0 border border-border">
                            <AvatarImage src={other.avatar || ""} alt={other?.name || "User"}/>
                            <AvatarFallback className="font-semibold">
                                {other.name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={cn("text-sm", isUnread ? "font-bold text-foreground" : "font-medium text-foreground/90")}>{other?.name}</span>
                                {convo.lastMessageAt && (
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {new Date(convo.lastMessageAt).toLocaleTimeString("en-NG", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    timeZone: "Africa/Lagos",
                                                })}
                                    </span>
                                )}
                            </div>
                            <span className={cn("text-xs truncate mt-0.5", isUnread ? "text-foreground font-semibold" : "text-muted-foreground")}>
                                {lastMessage?.content ?? "No messages yet"}
                            </span>
                        </div>

                        {isUnread && <Badge className="shrink-0 h-2.5 w-2.5 p-0 rounded-full bg-primary"/>}
                    </Link>
                )
            })}
        </div>
    )
}