import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const backendRes = await proxyFetchRoute(request, `/api/payment/withdraw`, { method: "POST" });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Withdrawal not successful" }, { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Withdrawal POST]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}