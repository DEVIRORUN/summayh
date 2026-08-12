import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    const backendRes = await proxyFetchRoute(request, `/api/orders/seller?page=${page}&limit=${limit}`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch orders" },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BFF ORDER SELLER GET]: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
