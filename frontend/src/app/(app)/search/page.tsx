import { GigCard, type GigCardProps } from "@/components/theorems/GigCard";
import { EmptyState } from "@/components/axiom/EmptyState";
import { SearchX } from "lucide-react";

interface RawGigResult {
  id: string;
  title: string;
  decsription: string; // fix typo alter
  tags: string[];
  gigType: string;
  avgRating: number;
  totalReviews: number;
  coverImage: string;
  sellerUsername: string;
  sellerRating: number;
  isPro: boolean;
  avatar: string;
  startingPrice: number;
  relevance: number;
}

function mapToGigCardProps(raw: RawGigResult): GigCardProps {
    return {
        id: raw.id,
        title: raw.title,
        thumbnail: raw.coverImage,
        price: raw.startingPrice,
        tags: raw.tags,
        deliveryTime: "-",
        rating: { avgRating: raw.avgRating, reviewCount: raw.totalReviews },
        seller: {
            avatar: raw.avatar,
            name: raw.sellerUsername,
            isOnline: false,
            level: undefined,
        }
    }
}




async function searchGigs(query: string) {
    const res = await fetch(
        `${process.env.NODE_API_URL}/api/gig/search`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
            cache: "no-store", 
        }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
    const query = q || "";
    const rawGigs = query ? await searchGigs(query) : [];

    
    const gigs: GigCardProps[] = rawGigs.map(mapToGigCardProps);

    

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-lg font-semibold mb-6">
                {query ? `Results for "${query}"` : "Search gigs"}
            </h1>

            {gigs.length === 0 ? (
                <EmptyState
                    icon={<SearchX className="w-10 h-10" />}
                    title="No gigs found"
                    description="Try a different search term"
                />
            ): (
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {gigs.map((gig: GigCardProps) => (
                        <GigCard key={gig.id} {...gig} variant="compact"/>
                    ))}
                </div>
            )}
        </div>
    )
}