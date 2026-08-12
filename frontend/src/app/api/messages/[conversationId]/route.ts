import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const url = new URL(request.url);
        const query = url.search;


        const backendRes = await proxyFetchRoute(request, `/api/messages/${conversationId}${query}`, { method: "GET" });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Messages not found" }, { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Messages GET]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const body = await request.json();


        const backendRes = await proxyFetchRoute(request, `/api/messages/${conversationId}`, {
            method: "POST",
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Failed to send message" }, { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Messages POST]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}