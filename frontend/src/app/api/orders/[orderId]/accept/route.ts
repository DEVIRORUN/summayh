import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        const { orderId } = await params;
        const backendRes = await proxyFetchRoute(request, `/api/orders/${orderId}/accept`, { method: "POST" });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Failed to accept delivery" }, { status: backendRes.status });
        }
        return NextResponse.json(await backendRes.json());
    } catch (err) {
        console.error("[BFF ACCEPT ORDER]:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}