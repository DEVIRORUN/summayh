import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const { bookingId } = await params;

        const backendRes = await proxyFetchRoute(request, `/api/calls/bookings/${bookingId}/details`, {
            method: "GET",
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to fetch booking details" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Next.js Gateway Error]: (Calls/Bookings/[bookingId]/Details) ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}