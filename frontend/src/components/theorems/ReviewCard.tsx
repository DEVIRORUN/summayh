import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { RatingInline } from "../axiom/RatingInline";

export interface ReviewCardProps {
  reviewer: { avatar: string; name: string };
  rating: number;
  comment: string;
  date: string;
}

export function ReviewCard({ reviewer, rating, comment, date }: ReviewCardProps) {
  return (
    <div className="flex gap-3 py-3 border-b">
      <Avatar className="w-9 h-9">
        <AvatarImage src={reviewer.avatar} />
      </Avatar>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{reviewer.name}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <RatingInline avgRating={rating} size="sm" />
        <p className="text-sm text-muted-foreground">{comment}</p>
      </div>
    </div>
  );
}