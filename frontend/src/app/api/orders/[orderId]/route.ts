import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const backendRes = await proxyFetch(request, `/api/orders/${orderId}`, { method: "GET" });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Order not found" }, { status: backendRes.status })
        }

        const data = await backendRes.json();
        
        console.log("[BFF /api/orders/:orderId] backend data:", JSON.stringify(data, null, 2)); // temp
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Order GET]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}