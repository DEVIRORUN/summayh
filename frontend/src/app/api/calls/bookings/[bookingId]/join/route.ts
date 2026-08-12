import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const { bookingId } = await params;
        console.log("[BFF] bookingId:", bookingId);

        const backendRes = await proxyFetchRoute(request, `/api/calls/bookings/${bookingId}/join`, {
            method: "POST",
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to join fetch booking" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        console.log("[BFF DATA JOIN SESSION]:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Gateway Error]: (Calls/Bookings/[bookingId]) ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}