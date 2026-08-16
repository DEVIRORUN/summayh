import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query = "", budgetMax, location } = body;

    const params = new URLSearchParams({ q: query });
    if (budgetMax) params.set("budgetMax", String(budgetMax));
    if (location) params.set("location", location);

    // Call your Express/Node backend
    const backendRes = await proxyFetchRoute(
      request,
      `/api/gig/search?${params.toString()}`,
      { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
       }
    );

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Search failed" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}