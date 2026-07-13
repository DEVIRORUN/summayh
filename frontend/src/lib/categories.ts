export async function getCategories() {
    const res = await fetch(`${process.env.NODE_API_URL}/api/categories`, {
        next: { revalidate: 3600 }, // cache for an hour — categories rarely change
    });
    if(!res.ok) return [];
    return res.json();
}