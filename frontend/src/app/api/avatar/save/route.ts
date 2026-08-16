import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const backendRes = await proxyFetchRoute(
      request,
      "/api/avatar/save",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to save avatar" },
      { status: 500 }
    );
  }
}