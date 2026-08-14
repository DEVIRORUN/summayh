import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const body = await request.text();

        const backendRes = await proxyFetchRoute(request, "/api/email-otp/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.message || "Failed to verify OTP." },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Verify email OTP proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}