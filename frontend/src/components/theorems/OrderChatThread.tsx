import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
    id: string;
    senderId: string;
    senderAvatar: string;
    text: string;
    timestamp: string;
    isOwn: string;
}


interface OrderChatThreadProps {
    messages: ChatMessage[];
    onSend: (tetx: string) => void;
}

export function OrderChatThread({ messages, onSend }: OrderChatThreadProps) {
    const [input, setInput] = useState("");

    function handleSend() {
        if (!input.trim()) return;
        onSend(input);
        setInput("");
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto flex flex-col justify-end gap-3 p-3">
                {messages.map((m) => (
                    <div key={m.id} className={cn("flex gap-2 max-w-[75%]", m.isOwn && "self-end flex-row-reverse")}>
                        <Avatar className="w-7 h-7 shrink-0">
                            <AvatarImage src={m.senderAvatar}/>
                        </Avatar>
                        <div className={cn("rounded-lg px-3 py-2 text-sm", m.isOwn ? "bg-primary text-primary-foreground" : "bg-muted" )}>
                            <p>{m.text}</p>
                            <span className="text-[10px] opacity-60">{m.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 p-3 border-t">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..."/>
                <Button onClick={handleSend}>Send</Button>
            </div>
        </div>
    )

}