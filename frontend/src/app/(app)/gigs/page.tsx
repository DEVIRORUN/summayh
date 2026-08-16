import { Suspense } from "react";
import Link from "next/link";
import { GigCard } from "@/components/theorems/GigCard";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
}

async function fetchGigs(params: SearchParams) {
  const baseUrl = process.env.NODE_API_URL || "http://localhost:3001";
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", params.page);

  try {
    const res = await fetch(`${baseUrl}/api/gig?${queryParams.toString()}`, {
      cache: "no-store",
    });
    console.log("RES:", res)

    if (!res.ok) throw new Error("Failed to load gigs");
    return await res.json();
  } catch (err) {
    console.error("Error fetching gigs:", err);
    return { data: { data: [], pagination: { total: 0 } } };
  }
}

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const { category, search } = resolvedParams;

  const response = await fetchGigs(resolvedParams);
  const gigs = response?.data?.data || response?.data || [];
  const total = response?.data?.pagination?.total ?? gigs.length;

  const formattedTitle = category
    ? category.replace(/-/g, " ")
    : search
    ? `Results for "${search}"`
    : "Explore Services";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "Gigs", href: "/gigs" },
          ...(category ? [{ label: formattedTitle }] : []),
        ]}
      />

      {/* Header & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 my-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight capitalize text-foreground">
            {formattedTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "service" : "services"} available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-medium border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <Suspense fallback={<GigsLoadingGrid />}>
        {gigs.length === 0 ? (
          <EmptyState category={category} search={search} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig: any) => (
              <GigCard
                key={gig.id}
                id={gig.id}
                title={gig.title}
                thumbnail={gig.coverImage || gig.images?.[0]}
                price={gig.tiers?.[0]?.price ?? 0}
                deliveryTime={
                  gig.tiers?.[0]?.deliveryDays
                    ? `${gig.tiers[0].deliveryDays} days`
                    : "1-3 days"
                }
                rating={{
                  avgRating: gig.avgRating || 5.0,
                  reviewCount: gig.totalReviews || 0,
                }}
                seller={{
                  name:
                    gig.seller?.user?.name ||
                    gig.seller?.sellerUsername ||
                    "Seller",
                  avatar: gig.seller?.avatar || "",
                  isPro: gig.seller?.isPro ?? false,
                  isOnline: true,
                }}
              />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}

function EmptyState({
  category,
  search,
}: {
  category?: string;
  search?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border rounded-xl bg-card/50 my-8">
      <div className="h-12 w-12 rounded-full  flex items-center justify-center mb-4 text-muted-foreground">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No services found</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {category
          ? `We couldn't find any active services under "${category.replace(
              /-/g,
              " "
            )}".`
          : search
          ? `No matches found for "${search}". Try checking for spelling errors or using broader keywords.`
          : "There are currently no active gigs listed."}
      </p>
      <Link
        href="/gigs"
        className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
      >
        View All Services
      </Link>
    </div>
  );
}

function GigsLoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border border-border rounded-xl overflow-hidden bg-card animate-pulse h-72 flex flex-col justify-between p-4"
        >
          <div className="bg-muted h-36 rounded-lg w-full mb-3" />
          <div className="bg-muted h-4 rounded w-3/4 mb-2" />
          <div className="bg-muted h-4 rounded w-1/2 mb-4" />
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="bg-muted h-6 w-6 rounded-full" />
            <div className="bg-muted h-4 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}