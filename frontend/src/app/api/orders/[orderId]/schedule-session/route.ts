import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {

        const { orderId } = await params;
        const body = await request.json();
    
        const backendRes = await proxyFetchRoute(request, `/api/orders/${orderId}/schedule-session`, {
            method: "POST", body: JSON.stringify(body),
        });
        if (!backendRes.ok) {
            const errData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errData.message || "Failed to schedule session" }, { status: backendRes.status })
        }
    
        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[BFF SCHEDULE SESSION]: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 