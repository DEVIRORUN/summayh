import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username") ?? "";

        const backendRes = await proxyFetchRoute(
            request,
            `/api/seller/check-username?username=${encodeURIComponent(username)}`,
            { method: "GET" }
        );

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { available: false, message: data.message || "Failed to check username" },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Check username BFF error", err);
        return NextResponse.json({ available: false, message: "Internal Server Error" }, { status: 500 })
    }
}