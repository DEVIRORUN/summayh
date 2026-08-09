import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sellerId: string }> }
) {
    try {
        const { sellerId } = await params;
        const { searchParams } = new URL(request.url);
        const query = searchParams.toString();

        const backendRes  = await proxyFetch(request, `/api/seller/${sellerId}/available-slots?${query}`, {
            method: "GET"
        })

        if (!backendRes.ok) {
        const errorData = await backendRes.json().catch(() => ({}));
        return NextResponse.json({ error: errorData.message || "Failed to fetch slots" }, { status: backendRes.status });
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[BFF SLOTS GET]: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}