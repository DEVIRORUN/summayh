import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote } from "lucide-react";


export interface TestimonialCardProps {
  quote: string;
  author: { name: string; avatar: string; role?: string }; // role = e.g. "Small Business Owner"
}

export function TestimonialCard({ quote, author }: TestimonialCardProps) {
    const name = author?.name || "Anonymous Client";
    const avatarUrl = author?.avatar || "";
    const role = author?.role || "";

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  return (
    <Card className="p-5 flex flex-col gap-4 bg-foreground/50 border-foreground/80 h-full">
      {/* Quotation mark is purely decorative — doesn't come from data */}
      <Quote className="w-6 h-6 text-muted-foreground/40" />
      <p className="text-sm text-background leading-relaxed italic flex-grow">
        {quote}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        <Avatar className="w-8 h-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name}/>}

          <AvatarFallback className="bg-zinc-800 text-xs text-zinc-200 font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{name}</span>
          {role && <span className="text-xs text-muted-foreground">{role}</span>}
        </div>
      </div>
    </Card>
  );
}