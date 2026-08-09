import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const { bookingId } = await params;

        const backendRes = await proxyFetch(request, `/api/calls/bookings/${bookingId}/join`, {
            method: "GET",
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to join fetch booking" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Gateway Error]: (Calls/Bookings/[bookingId]) ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}