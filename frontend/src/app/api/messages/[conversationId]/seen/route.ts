import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;

        const backendRes = await proxyFetch(request, `/api/messages/${conversationId}/seen`, {
            method: "PATCH",
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json({ error: errorData.message || "Failed to mark message as seen" }, { status: backendRes.status })
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch(error) {
        console.error("[BFF Messages PATCH]: ", error);
        return NextResponse.json({ error: "Internal Server error" }, { status: 500 })
    }
}