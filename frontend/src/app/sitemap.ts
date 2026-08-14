import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://summayh.com";

// Adjust these fetches to match your actual backend endpoints.
// Keep them server-only, unauthenticated, and fast — this runs at build/request time.

async function getPublishedGigSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/gig/public/sitemap-list`, {
            next: { revalidate: 3600 }, // regenerate hourly
        });
        if (!res.ok) return [];
        const { data } = await res.json();
        return data ?? [];
    } catch {
        return [];
    }
}

async function getCategorySlugs(): Promise<{ slug: string }[]> {
    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/category/tree`, {
            next: { revalidate: 86400 }, // categories barely change — daily is plenty
        });
        if (!res.ok) return [];
        const { data } = await res.json();
        // Flatten parent + child categories into slugs
        const slugs: { slug: string }[] = [];
        for (const cat of data ?? []) {
            slugs.push({ slug: cat.slug });
            for (const sub of cat.children ?? []) {
                slugs.push({ slug: `${cat.slug}/${sub.slug}` });
            }
        }
        return slugs;
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [gigs, categories] = await Promise.all([
        getPublishedGigSlugs(),
        getCategorySlugs(),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/gigs`,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/become-a-seller`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
        url: `${baseUrl}/categories/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
    }));

    const gigRoutes: MetadataRoute.Sitemap = gigs.map((g) => ({
        url: `${baseUrl}/gigs/${g.slug}`,
        lastModified: new Date(g.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...gigRoutes];
}