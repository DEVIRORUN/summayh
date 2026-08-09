import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(
    request: Request
) {
    try {
        const { searchParams } = new URL(request.url) 
        const fileId = searchParams.get("fileId");

        if (!fileId) {
            return NextResponse.json({ error: "fileId is required" }, { status: 400 });
        }

        const backendRes = await proxyFetch(request, `/api/orders/deliveries/${fileId}/download-url`, {
            method: "GET"
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}))
            return NextResponse.json(
                {  error: errorData.message || "Failed to get download URL" }, 
                { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (err) {
        console.log("[BFF DOWNLOAD URL]:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}