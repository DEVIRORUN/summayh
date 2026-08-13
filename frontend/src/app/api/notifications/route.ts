import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";


export async function GET(request: Request) {
  try {
    const backendRes = await proxyFetchRoute(request, `/api/notifications`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch notificstiosn" },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BFF NOTIFICATION GET]: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
