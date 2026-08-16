export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GigGallery } from "@/components/axiom/GigGallery";
import { GigTitleBlock } from "@/components/theorems/GigTitleBlock";
import { GigDescriptionAccordion } from "@/components/axiom/GigDescriptionAccordion";
import { GigOrderPanel } from "@/components/shared/GigOrderPanel";
import { getCurrentUser } from "@/lib/auth";
import { GigReviews } from "@/components/axiom/GigReviews";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface GigPageProps {
  params: Promise<{ id: string }>;
}

const BASE_URL = "https://summayh.com";

async function getGig(id: string) {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gig/${id}`, {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data ?? null;
  } catch (error) {
    console.error(`[SEO Metadata Fetch Failure] Gig ID ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: GigPageProps): Promise<Metadata> {
  const { id } = await params;
  const gig = await getGig(id);

  if (!gig) {
    return {
      title: "Gig Not Found | SUMMAYH",
      description: "The requested marketplace offering could not be located.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${gig.title} - Book on SUMMAYH`;
  const plainTextDescription = (gig.description || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);

  const description =
    plainTextDescription || `Book ${gig.title} from verified creators on SUMMAYH.`;

  const rawImage = gig.coverImage || gig.images?.[0] || "/og-default.png";
  const absoluteImageUrl = rawImage.startsWith("http")
    ? rawImage
    : `${BASE_URL}${rawImage}`;

  const canonicalUrl = `${BASE_URL}/gigs/${id}`;

  return {
    title,
    description,
    keywords: [
      gig.category?.name,
      ...(gig.tags ?? []),
      "SUMMAYH",
      "NIGERIA campus market",
      "student freelancers",
    ].filter(Boolean),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SUMMAYH Marketplace",
      locale: "en_NG",
      type: "article",
      images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: gig.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function GigDetailPage({ params }: GigPageProps) {
  const { id } = await params;
  const gig = await getGig(id);

  if (!gig) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: gig.title,
      image: gig.coverImage ? [gig.coverImage] : [],
      description: gig.description?.replace(/<[^>]*>?/gm, "").slice(0, 500) || "",
      sku: gig.id,
      brand: { "@type": "Brand", name: "SUMMAYH" },
      offers: {
        "@type": "Offer",
        url: `${BASE_URL}/gigs/${id}`,
        priceCurrency: "NGN",
        price: gig.price || 0,
        priceValidUntil: new Date(
          new Date(gig.updatedAt || gig.createdAt).getTime() + 31536000000
        ).toISOString().split("T")[0],
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Person",
          name: gig.seller?.fullName || gig.seller?.username || "SUMMAYH Seller",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: gig.category?.name || "Gigs",
          item: `${BASE_URL}/categories/${gig.category?.slug || ""}`,
        },
        { "@type": "ListItem", position: 3, name: gig.title, item: `${BASE_URL}/gigs/${id}` },
      ],
    },
  ];

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === gig.seller?.userId;


  return (
    <>
      <Breadcrumbs
          items={[
            { label: "Gigs", href: "/gigs" },
            { label: gig.category?.name || "Category", href: `/gig?category=${gig.category?.slug}` },
            { label: gig.title },
          ]}
        />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          {isOwner && gig.state !== "ACTIVE" && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-600 text-xs px-3 py-2 font-medium">
              {gig.state === "DRAFT" ? "This gig is a draft — only you can see it." : `Status: ${gig.state}`}
            </div>
          )}
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

          <GigReviews gigId={gig.id} />
        </div>

        <div className="md:col-span-1">
          <GigOrderPanel
            sellerId={gig.seller.id}
            sellerUserId={gig.seller.userId}
            gigId={gig.id}
            tiers={gig.tiers}
            deliveryMode={gig.deliveryMode}
          />
        </div>
      </div>
    </>
  );
}