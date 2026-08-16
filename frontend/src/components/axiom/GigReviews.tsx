import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyer: { id: string; name: string };
}

async function getGigReviews(gigId: string): Promise<{ data: Review[]; meta: any }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/gig/${gigId}`, {
      cache: "no-store",
    });
    if (!res.ok) return { data: [], meta: {} };
    return await res.json();
  } catch {
    return { data: [], meta: {} };
  }
}

export async function GigReviews({ gigId }: { gigId: string }) {
  const { data: reviews } = await getGigReviews(gigId);

  if (reviews.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No reviews yet - be the first to leave one after your order.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Reviews ({reviews.length})</h2>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-3 last:border-b-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{r.buyer.name}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}