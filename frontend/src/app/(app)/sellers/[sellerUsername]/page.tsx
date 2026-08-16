export const dynamic = 'force-dynamic';

import { getSellerByUsername } from "@/lib/seller";
import { GigCard } from "@/components/theorems/GigCard";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default async function SellerProfilePage({
    params,
}: {
    params: Promise<{ sellerUsername: string }>;
}) {
    const { sellerUsername } = await params
    const seller = await getSellerByUsername(sellerUsername);

    if (!seller) notFound();

    return (
        <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
            <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted shrink-0">
                    {seller.avatar ? (
                        <Image src={seller.avatar} alt={seller.user.name} fill className="object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-medium">
                            {seller.user.name?.[0] ?? "?"}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">{seller.user.name}</h1>
                        {seller.isPro && <Badge variant="secondary">Pro</Badge>}
                        {seller.founderBadge && <Badge variant="outline">Founder</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">@{seller.sellerUsername}</p>
                    <p className="text-sm text-muted-foreground">{seller.user.university}</p>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">{seller.avgRating.toFixed(1)}★</span>
                        <span className="text-muted-foreground">({seller.totalReviews} reviews)</span>
                    </div>
                </div>
            </div>

            {seller.bio && <p className="text-sm text-muted-foreground max-w-2xl">{seller.bio}</p>}

            {seller.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {seller.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-muted text-xs">
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            <div>
                <h2 className="text-lg font-medium mb-3">Gigs by {seller.user.name}</h2>
                {seller.gigs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active gigs yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {seller.gigs.map((gig: any) => (
                            <GigCard
                                key={gig.id}
                                id={gig.id}
                                title={gig.title}
                                coverImage={gig.coverImage}
                                price={gig.tiers?.[0]?.price ?? 0}
                                deliveryTime="-"
                                rating={{ avgRating: gig.avgRating, reviewCount: gig.totalReviews }}
                                seller={{
                                    avatar: seller.avatar,
                                    name: seller.user.name,
                                    sellerUsername: seller.sellerUsername,
                                    isOnline: seller.isOnline,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}