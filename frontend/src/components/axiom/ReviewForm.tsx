"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ReviewForm({ orderId, onSubmitted }: { orderId: string; onSubmitted?: () => void }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit() {
        if (rating < 1) {
            setError("Please select a star rating.");
            return;
        }
        if (comment.trim().length < 10) {
            setError("Comment must be at least 10 characters.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, rating, comment: comment.trim() }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to submit review");
            }

            setSubmitted(true);
            onSubmitted?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Thanks for your review!
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 rounded-md border border-border p-4">
            <span className="text-sm font-medium">Leave a review</span>

            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                (hoverRating || rating) >= star
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                            )}
                        />
                    </button>
                ))}
            </div>

            <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your experience? (min. 10 characters)"
                className="text-sm min-h-20"
            />

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-fit">
                {isSubmitting ? "Submitting..." : "Submit review"}
            </Button>
        </div>
    );
}