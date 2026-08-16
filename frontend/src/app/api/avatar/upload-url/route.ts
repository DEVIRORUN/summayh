import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const backendRes = await proxyFetchRoute(
      request,
      "/api/avatar/upload-url",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}