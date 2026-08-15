import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendRes = await proxyFetchRoute(request, "/api/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || "Google login failed" },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json(data);
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    console.error("Google login BFF error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}