import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";

        const backendRes = await proxyFetch(
            request,
            `/api/gigs/search?q=${encodeURIComponent(query)}`,
            { method: "GET" }
        )

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Search faield" },
                { status: backendRes.status }
            );
        }

        const data = backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
}