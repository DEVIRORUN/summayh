import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params;
    const body = await request.json();

    const backendRes = await proxyFetch(request, `/api/gig/${gigId}/tiers`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      console.log("[BFF TIERS PATCH] backend error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to save tiers" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) { 
    console.error("[BFF TIERS PATCH]: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
