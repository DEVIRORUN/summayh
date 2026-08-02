"use client";

import { OrderChatThread, type ChatMessage } from "@/components/theorems/OrderChatThread";
import { useState } from "react";

export function OrderChatSection({ orderId }: { orderId: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    async function handleSendMessage(text: string) {
        console.log("Sending message for order: ", orderId, text);
        // TODO: Hit your API endpoint to save the message
    }

    return (
        <div className="w-full min-w-0 border border-border rounded-md h-96 flex flex-col">
            <OrderChatThread messages={messages} onSend={handleSendMessage} />
        </div>
    )
}