import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params;

    const backendRes = await proxyFetch(request, `/api/gig/${gigId}/publish`, {
      method: "PATCH",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to publish gig" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) { 
    console.error("[BFF PUBLISH PATCH]: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
