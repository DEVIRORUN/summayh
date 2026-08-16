import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await proxyFetchRoute(request, "/api/reviews", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.message || data.error || "Failed to submit review" },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Submit review BFF error", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}