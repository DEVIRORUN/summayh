"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface OrderChatThreadProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function OrderChatThread({ messages, onSend }: OrderChatThreadProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset on send like that
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  return (
    <div className="flex flex-col h-full w-full min-w-0 min-h-0">
      <div className="flex-1 w-full gap-2 min-w-0 min-h-0 overflow-y-auto flex flex-col space-y-0-3 p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2 max-w-[75%]",
              m.isOwn && "ml-auto flex-row-reverse",
            )}
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={m.senderAvatar} />
            </Avatar>
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm min-w-0 break-words overflow-hidden",
                m.isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <p className="break-words">{m.text}</p>
              <span className="text-[10px] opacity-60 block">{m.timestamp}</span>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef}/>
      </div>
      <div className="flex w-full min-w-0 gap-2 p-3 border-t shrink-0 bg-background">
        <Textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 flex-wrap min-w-0 min-h-[38px] max-h-32 overflow-hidden resize-none leading-normal"
          value={input}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend()
            }
          }}
          placeholder="Type a message..."
        />
        <Button
          className="shrink-0 h-[38px] hover:bg-foreground bg-muted-foreground cursor-pointer"
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
