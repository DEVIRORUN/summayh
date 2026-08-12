import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";


export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await proxyFetchRoute(request, `/api/seller/availability`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData.message || "Failed to save availability" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("[BFF AVAILABILITY PATCH]: ", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


export async function GET(request: Request) {
  try {
    const backendRes = await proxyFetchRoute(request, `/api/seller/availability`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch availability" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BFF AVAILABILITY GET]: ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}