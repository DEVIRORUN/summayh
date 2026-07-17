import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import { FaXTwitter, FaFacebook, } from "react-icons/fa6"
import { useState } from "react";



interface ShareModalProps {
  url: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({ url, title, open, onOpenChange }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    function copyLink() {
        navigator.clipboard.writeText(url);
        setCopied(true);

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent  className="border-zinc-800">
            <DialogHeader><DialogTitle className="text-xl font-semibold">Share this gig</DialogTitle></DialogHeader>
            <div className="flex items-center gap-2">
            <Input value={url} readOnly disabled className="select-none pointer-events-none" />
            <Button size="sm" onClick={copyLink} className="shrink-0 min-w-[70px] cursor-pointer">Copy</Button>
            </div>
            <div className="flex gap-3 mt-2">
                <Button variant="outline" size="icon" className="hover:border-zinc-800"><FaXTwitter className="w-4 h-4 text-foreground" /></Button>
                <Button variant="outline" size="icon" className="hover:border-zinc-800"><FaFacebook className="w-4 h-4 text-foreground" /></Button>
                <Button variant="outline" size="icon" className="hover:border-zinc-800"><MessageCircle className="w-4 h-4 text-foreground" /></Button>
            </div>
        </DialogContent>
        </Dialog>
    );
}

