import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ callSessionId: string }> }
) {
    try {
        const { callSessionId } = await params;
        const body = await request.text();

        const backendRes = await proxyFetch(request, `/api/session-material/${callSessionId}`, {
            method: "POST",
            body,
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to Save Material" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Materials Error]: SESSION MATERIAL SAVE TO DB ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ callSessionId: string }> }
) {
    try {
        const { callSessionId } = await params;

        const backendRes = await proxyFetch(request, `/api/session-material/${callSessionId}`, {
            method: "GET",
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to Fetch Materials" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Materials Error]: SESSION MATERIAL FETCHING ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}