import { getSellerGigs } from "@/lib/gigs";
import { type GigCardProps } from "@/components/theorems/GigCard";
import { GigFilterBar, type GigSortOption } from "@/components/axiom/GigFilterBar";
import { GigCard } from "@/components/theorems/GigCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";


type pageProps = {
    searchParams: Promise<{ page: string; limit: string; sort: GigSortOption; }>;
}
export default async function GigsDahboardPage({
  searchParams,
}: pageProps) {
    const gigs = await getSellerGigs();

    // console.log("Response payload:", gigs)

    if (!gigs|| !Array.isArray(gigs.data)) {
        return <div className="max-4xl mx-auto px-4 py-16 text-center">Gig not found.</div>
    }

    if(gigs.data.length === 0) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-muted-foreground">You have no gigs, go create a gig.</span>
                <Link href="/gigs">
                    <Button variant="outline" className="cursor-pointer rounded-sm">Create Gigs</Button>
                </Link>
            </div>
        )
    }

  const { page = "1", limit = "10" } = await searchParams;

  const sortBy = (await searchParams)?.sort || "recent";
  const sortedGigs = [...gigs.data].sort((a: any, b: any) => {
    if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortBy === "old") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    const getMinPrice = (gig: GigCardProps) => {
        if (!gig.tiers || gig.tiers.length === 0) return 0;
        return Math.min(...gig.tiers.map((t: any) => Number(t.price) || 0)) ;
    }

    if (sortBy === "price_high_low") {
        return getMinPrice(b) - getMinPrice(a);
    }

    if (sortBy === "price_low_high") {
        return getMinPrice(a) - getMinPrice(b);
    }

    return 0;
  });

  return (
    <div className="flex flex-col max-w-5xl gap-4 w-full min-w-0 p-4">
      <header className="flex flex-row justify-between">
        <span className="text-2xl font-semibold">Gig Page</span>
      </header>

      <GigFilterBar variant="seller" />

      <div className="gigs flex flex-col gap-2">
        {sortedGigs.map((gig) => {
          return (
            <GigCard
              key={gig.id}
              id={gig.id}
              title={gig.title}
              thumbnail={gig.coverImage || gig.thumbnail || "/placeholder.jpg"}
              price={gig.price}
              tiers={gig.tiers}
              deliveryTime={gig.deliveryTime}
              rating={{
                avgRating: gig.avgRating ?? 0,
                reviewCount: gig.totalReviews ?? 0,
              }}
              seller={{
                name: gig.seller?.sellerUsername || "Seller",
                avatar: gig.seller?.avatar || "",
                isOnline: gig.seller?.isOnline ?? false,
              }}
              tags={gig.tags}
              variant="list"
            />
          );
        })}
      </div>
    </div>
  );
}
