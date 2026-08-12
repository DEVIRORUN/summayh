import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function GET(request: Request) {
    try {
        const backendRes = await proxyFetchRoute(request, "/api/category/trending", {
            method: "GET",
        });

        // 4. Node error, logs
        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to fetch top categories" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        // 5. Success! Return
        return NextResponse.json(data);
    } catch (error){
        console.error("[Next.js Gateway Error ]: (Category/trending) ->", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}