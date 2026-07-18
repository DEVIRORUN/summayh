export async function getCategories() {
    const res = await fetch(`${process.env.NODE_API_URL}/api/categories`, {
        next: { revalidate: 3600 }, // cache for an hour — categories rarely change
    });
    if(!res.ok) return [];
    return res.json();
}

export async function getTrendingCategories() {
    try {
        const backendUrl = process.env.NODE_API_URL || "http://localhost:3000";

        const res = await fetch(`${backendUrl}/api/category/trending`, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return [];
        }

        const data = await res.json();

        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch categories server-side:", error);
        return [];
    }
}