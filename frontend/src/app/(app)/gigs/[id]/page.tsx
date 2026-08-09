import { GigGallery } from "@/components/axiom/GigGallery";
import { GigTitleBlock } from "@/components/theorems/GigTitleBlock";
import { GigDescriptionAccordion } from "@/components/axiom/GigDescriptionAccordion";
import { GigOrderPanel } from "@/components/shared/GigOrderPanel";

async function getGig(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gig/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;

  const body = await res.json();
  return body.data;
}

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gig = await getGig(id);

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        Gig not found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 flex flex-col gap-6">
        <GigTitleBlock
          title={gig.title}
          category={gig.category?.name || "Uncategorized"}
          seller={{
            avatar: gig.seller?.avatar,
            name: gig.seller?.sellerUsername || gig.seller?.name,
            isOnline: gig.seller?.isOnline ?? false,
            level: gig.seller?.level,
          }}
          rating={{ avgRating: gig.avgRating, reviewCount: gig.totalReviews }}
        />

        <GigGallery
          media={
            gig.coverImage
              ? [gig.coverImage, ...gig.images.filter((img: any) => img !== gig.coverImage)]
              : gig.images ?? []
          }
        />

        <GigDescriptionAccordion 
          description={gig.description} 
          deliveryMode={gig.deliveryMode}
          tiers={gig.tiers} 
        />
      </div>

      {/* Right column — pricing tiers + order action, client-interactive */}
      <div className="md:col-span-1">
        <GigOrderPanel sellerId={gig.seller.id} gigId={gig.id} tiers={gig.tiers} deliveryMode={gig.deliveryMode}/>
      </div>
    </div>
  );
}
