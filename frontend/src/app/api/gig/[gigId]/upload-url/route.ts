import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gigId: string }> }
) {
  try {
    const { gigId } = await params;
    const body = await request.json();

    const backendRes = await proxyFetch(request, `/api/gig/${gigId}/upload-url`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to generate uplaod-url" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) { 
    console.error("[BFF GALLERY[UPLOAD-URL] POST]: ", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}