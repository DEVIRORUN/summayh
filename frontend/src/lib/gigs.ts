export async function getGigDetails(id: string) {
    const res = await fetch(`${process.env.NODE_API_URL}/api/gig/${id}`);
    if (!res.ok) return null;
    return res.json();
}