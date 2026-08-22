import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await proxyFetchRoute(request, "/api/seller/onboard", {
            method: "POST",
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to onboard seller" },
                { status: backendRes.status }
            );
            console.log(backendRes.status, errorData)
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}