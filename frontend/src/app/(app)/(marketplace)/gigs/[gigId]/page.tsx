import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface GigPageProps {
  params: Promise<{ gigId: string }>;
}

const BASE_URL = "https://summayh.com";

async function getGig(gigId: string) {
  try {
    const res = await fetch(`${process.env.NODE_API_URL}/gig/${gigId}`, {
      next: { revalidate: 3600, tags: [`gig-${gigId}`] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error(`[SEO Metadata Fetch Failure] Gig ID ${gigId}:`, error);
    return null;
  }
}

// Fixed: Exported generateMetadata so Next.js executes it
export async function generateMetadata({ params }: GigPageProps): Promise<Metadata> {
  const { gigId } = await params;
  const gig = await getGig(gigId);

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

  const canonicalUrl = `${BASE_URL}/gigs/${gigId}`;

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
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SUMMAYH Marketplace",
      locale: "en_NG",
      type: "article",
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: gig.title,
        },
      ],
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
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function GigPage({ params }: GigPageProps) {
  const { gigId } = await params;
  const gig = await getGig(gigId);

  // Fixed: Check if gig object is null, not gigId
  if (!gig) notFound();

  // Dual Schema: Product + BreadcrumbList for Google Rich Snippets
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product", // Fixed: Was "Prisma"
      name: gig.title,
      image: gig.coverImage ? [gig.coverImage] : [],
      description: gig.description?.replace(/<[^>]*>?/gm, "").slice(0, 500) || "",
      sku: gig.id,
      brand: { "@type": "Brand", name: "SUMMAYH" },
      offers: {
        "@type": "Offer",
        url: `${BASE_URL}/gigs/${gigId}`,
        priceCurrency: "NGN",
        price: gig.price || 0,
        priceValidUntil: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
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
        {
          "@type": "ListItem",
          position: 1, // Fixed typo: postion
          name: "Home",
          item: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 2, // Fixed typo: postion
          name: gig.category?.name || "Gigs",
          item: `${BASE_URL}/categories/${gig.category?.slug || ""}`,
        },
        {
          "@type": "ListItem",
          position: 3, // Fixed typo: postion
          name: gig.title,
          item: `${BASE_URL}/gigs/${gigId}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <h1 className="text-3xl font-bold">{gig.title}</h1>
      </main>
    </>
  );
}