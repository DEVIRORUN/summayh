import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";



interface ContactSellerButtonProps {
    sellerName: string;
    onSend: (message: string) => void;
}

export function ContactSellerButton({ sellerName, onSend }: ContactSellerButtonProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    function handleSend() {
        onSend(message); // send message
        setMessage(""); // We make message empty after sending
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Contact {sellerName}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Message {sellerName}</DialogTitle></DialogHeader>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what you need..."/>
                <Button onClick={handleSend} disabled={!message.trim()}>Send</Button>
            </DialogContent>
        </Dialog>
    )
}