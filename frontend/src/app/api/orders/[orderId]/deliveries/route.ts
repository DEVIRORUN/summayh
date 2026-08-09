import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const body = await request.json();

        const backendRes = await proxyFetch(request, `/api/orders/${orderId}/deliveries`, {
            method: "POST",
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}))
            return NextResponse.json(
                {  error: errorData.message || "Failed to submit delivery" }, 
                { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (err) {
        console.log("[BFF DELIVERY SUBMITTING POST]:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}