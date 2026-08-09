import { cookies } from "next/headers";
import { type GigCardProps } from "@/components/theorems/GigCard";


interface GigsResponse {
    data: GigCardProps[] | null;
    meta: { total: number; page: number; limit: number; totalPages: number }
}

export async function getSellerGigs(page = 1, limit = 15): Promise<GigsResponse | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/gig/me?page=${page}&limit=${limit}`, {
            cache: "no-store",
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`)
            return null;
        }

        return res.json();
    } catch (err) {
        console.error("Fetched error:", err);
        return null;
    }
}