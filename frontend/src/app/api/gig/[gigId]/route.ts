import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params;

    const backendRes = await proxyFetch(request, `/api/gig/${gigId}`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Gig not found" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) { // Not needed
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}