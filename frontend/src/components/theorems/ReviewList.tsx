import { EmptyState } from "../axiom/EmptyState";
import { MessageSquare } from "lucide-react";
import { ReviewCard, type ReviewCardProps } from "./ReviewCard";
import { Button } from "@/components/ui/button";

interface ReviewsListProps {
  reviews: ReviewCardProps[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ReviewsList({ reviews, onLoadMore, hasMore }: ReviewsListProps) {
  if (reviews.length === 0) {
    return <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="No reviews yet" />;
  }

  return (
    <div className="flex flex-col">
      {reviews.map((r, i) => <ReviewCard key={i} {...r} />)}
      {hasMore && (
        <Button variant="outline" size="sm" className="mt-4 self-center" onClick={onLoadMore}>
          Load more reviews
        </Button>
      )}
    </div>
  );
}