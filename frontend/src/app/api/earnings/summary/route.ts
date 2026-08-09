import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";


export async function GET(request: Request) {
    try {
        const backendRes = await proxyFetch(request, '/api/payment/summary', { method: "GET" });

        console.log("[BFF SUMMARY STATUS]:", backendRes.status);

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to fetch earnings" },
                { status: backendRes.status }
            )
        }

        const payload = await backendRes.json();
        console.log("[BFF SUMMARY PAYLAOD FORM BE]:", payload);
        
        const data = payload.data ? payload.data : payload;
        return NextResponse.json(data)
    } catch (error) {
        console.log("[BFF SUMMARY GET]: ", error)
        return NextResponse.json({ error: "Soemthing went wrong"}, { status: 500 })
    }
}