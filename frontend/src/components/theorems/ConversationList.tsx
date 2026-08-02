"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ConversationListItem } from "@/lib/message";
import { useRouter } from "next/navigation";

interface ConversationListProps {
    conversations: ConversationListItem[];
    currentUserId: string;
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
    const router = useRouter();
    
    if (conversations.length === 0) {
        return <span className="text-muted-foreground">No conversation yet.</span>
    }
    return (
        <div className="flex flex-col gap-1">
            {conversations.map((convo) => {
                const isUserA = convo.userAId === currentUserId;
                const other = isUserA ? convo.userB : convo.userA;
                const lastMessage = convo.messages[0];

                const isUnread = 
                    lastMessage && // If there's a new message
                    lastMessage.senderId !== currentUserId && // And the sender is not me
                    !lastMessage.seenAt; // show it as seenAt

                return (
                    <Link
                        key={convo.id}
                        href={`/dashboard/messages/${convo.id}`}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/40 cursor-pointer cursor-pointer"
                    >
                        <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src={other.avatar || ""} />
                            <AvatarFallback>{other.name?.charAt(0) ?? "?"}</AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className={cn("", isUnread ? "font-semibold" : "font-medium")}>{other.name}</span>
                                {convo.lastMessageAt && (
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {new Date(convo.lastMessageAt).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}
                                    </span>
                                )}
                            </div>
                            <span className={cn("text-sm truncate", isUnread ? "text-foreground font-medium" : "text-muted-foreground")}>
                                {lastMessage?.content ?? "No messages yet"}
                            </span>
                        </div>

                        {isUnread && <Badge className="shrink-0 h-2 w-2 p-0 rounded-full bg-primary"/>}
                    </Link>
                )
            })}
        </div>
    )
}