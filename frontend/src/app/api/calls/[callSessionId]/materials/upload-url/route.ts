import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ callSessionId: string }> }
) {
    try {
        const { callSessionId } = await params;
        const body = await request.text();

        const backendRes = await proxyFetchRoute(request, `/api/session-material/${callSessionId}/generate`, {
            method: "POST",
            body,
        });
        console.log("Forwarding body:", body);

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to Generate UploadUrl and PublicUrl" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Materials Error]: SESSION MATERIAL URL GENERATION ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}