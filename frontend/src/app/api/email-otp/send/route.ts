import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const backendRes = await proxyFetchRoute(request, "/api/email-otp/send", {
            method: "POST",
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.message || "Failed to send OTP." },
                { status: backendRes.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Send email OTP proxy error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}