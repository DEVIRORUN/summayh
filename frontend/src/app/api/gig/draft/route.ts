import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        // 1. extract the JSON body typed by the user in page
        const body = await request.json();

        const backendRes = await proxyFetchRoute(request, "/api/gig/draft", {
            method: "POST",
            body: JSON.stringify(body),
        });

        // 4. Node error, logs
        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to create gig" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        // 5. Success! Return
        return NextResponse.json(data);
    } catch (error) { 
        console.error("Gig API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}