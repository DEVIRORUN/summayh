import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";
import { getCurrentUser } from "@/lib/auth";


export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const backendRes = await proxyFetchRoute(request, `/api/founders-pass/initialize`, {
            method: "POST",
            body: JSON.stringify({ email: user.email }),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
          return NextResponse.json({ error: errorData.message || "Failed to initialize" }, { status: backendRes.status });
        }
        return NextResponse.json(await backendRes.json());
    } catch (error) {
        console.error("[BFF FOUNDERS INIT]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}