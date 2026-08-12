import { MetadataRoute } from "next";

const BASE_URL = "https://summayh.com";
const ITEMS_PER_SITEMAP = 10000;

export async function generateSitemaps() {
  try {
    const res = await fetch(`${process.env.NODE_API_URL}/gig/count`, {
      next: { revalidate: 3600 },
    });
    const { count = 0 } = res.ok ? await res.json() : {};

    const totalSitemaps = Math.max(1, Math.ceil(count / ITEMS_PER_SITEMAP));
    return Array.from({ length: totalSitemaps }, (_, id) => ({ id }));
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap =
    id === 0
      ? [
          { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
          { url: `${BASE_URL}/gigs`, lastModified: new Date(), changeFrequency: "always", priority: 0.9 },
          { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 }, // Fixed priority max 1.0
          { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
          { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.1 },
          { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.1 },
        ]
      : [];

  try {
    const offset = id * ITEMS_PER_SITEMAP;
    const [gigRes, categoryRes] = await Promise.all([
      fetch(`${process.env.NODE_API_URL}/gig?limit=${ITEMS_PER_SITEMAP}&offset=${offset}`, { // Fixed typo NDOE_API_URL
        next: { revalidate: 3600 },
      }),
      id === 0
        ? fetch(`${process.env.NODE_API_URL}/category`, { next: { revalidate: 86400 } })
        : Promise.resolve(null),
    ]);

    const gigData = gigRes?.ok ? (await gigRes.json()).data ?? [] : [];
    const categoryData = categoryRes?.ok ? (await categoryRes.json()).data ?? [] : [];

    const categoryRoutes: MetadataRoute.Sitemap = categoryData.map((c: any) => ({
      url: `${BASE_URL}/categories/${c.slug || c.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const gigRoutes: MetadataRoute.Sitemap = gigData.map((g: any) => ({ // Fixed variable map
      url: `${BASE_URL}/gigs/${g.id}`, // Fixed route path
      lastModified: g.updatedAt ? new Date(g.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...gigRoutes];
  } catch (error) {
    console.error(`[Sitemap Chunk ${id} Error]:`, error);
    return staticRoutes;
  }
}