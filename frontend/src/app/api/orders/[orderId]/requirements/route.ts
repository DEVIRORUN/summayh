import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const body = await request.json();

    const backendRes = await proxyFetchRoute(
      request,
      `/api/orders/${orderId}/requirements`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: data.message || data.error || "Failed to submit requirements",
        },
        {
          status: backendRes.status,
        }
      );
    }

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("[BFF Order Requirements POST]:", error);

    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 }
    );
  }
}