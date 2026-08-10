import { RatingInline } from "@/components/axiom/RatingInline";
import { Progress } from "@/components/ui/progress";


interface RatingBreakdown { stars: number; count: number; }

interface ReviewSummaryBarProps {
  avgRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown[]; // e.g. [{stars:5,count:80},{stars:4,count:20}...]
}

export function ReviewSummaryBar({ avgRating, totalReviews, breakdown }: ReviewSummaryBarProps) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{typeof avgRating === "number" ? avgRating.toFixed(1) : "0.0"}</span>
        <RatingInline avgRating={avgRating} size="sm" />
        <span className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</span>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {breakdown.map((b) => (
          <div key={b.stars} className="flex items-center gap-2">
            <span className="text-xs w-3">{b.stars}</span>
            <Progress value={(b.count / totalReviews) * 100} className="h-1.5" />
            <span className="text-xs text-muted-foreground w-8">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}