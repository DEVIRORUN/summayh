import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await params;

    const backendRes = await proxyFetch(request, `/api/orders/verify/${reference}`, {
      method: "GET",
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to verify Order" },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BFF ORDER VERIFY GET]: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
