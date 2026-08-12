import { NextResponse, type NextRequest } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(
    request: NextRequest,
) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get("limit") || "5";
        const backendRes = await proxyFetchRoute(request, `/api/orders/seller?limit=${limit}`, { method: "GET" });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Order not found" }, { status: backendRes.status })
        }

        const payload = await backendRes.json();

        const data = payload.data ? payload.data : payload; // better handling
        console.log("[ORDERS BFF]", data);
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Order GET]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}