import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params;

    const backendRes = await proxyFetchRoute(request, `/api/gig/${gigId}/draft`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetched gig draft data" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) { 
    console.error("[BFF DRAFT DATA GET]: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}