import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const body = await request.json();

        console.log("[BFF] calling backend:", `/api/orders/${orderId}/deliveries/upload-url`);
        
        const backendRes = await proxyFetch(request, `/api/orders/${orderId}/deliveries/upload-url`, {
            method: "POST",
            body: JSON.stringify(body),
        });

        console.log("[BFF] backend status:", backendRes.status);

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}))
            return NextResponse.json(
                {  error: errorData.message || "Failed to genearte uplaod URL" }, 
                { status: backendRes.status })
        }

        const data = await backendRes.json();
        console.log("data", data)
        return NextResponse.json(data);
    } catch (err) {
        console.log("[BFF UPLOAD URL]:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}