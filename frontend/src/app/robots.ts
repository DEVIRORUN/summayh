import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.summayh.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/settings",
                    "/settings/*",
                    "/messages",
                    "/messages/*",
                    "/orders",
                    "/orders/*",
                    "/gigs/new",
                    "/gigs/new/*",
                    "/auth/*",
                    "/checkout",
                    "/checkout/*",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}