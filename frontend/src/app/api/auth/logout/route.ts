import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const backendRes = await proxyFetchRoute(request, "/api/auth/logout", {
                method: "POST",
        });
        
        const data = await backendRes.json();

        if(!backendRes.ok) {
            return NextResponse.json(
                { error: data.message || "Login failed." },
                { status: backendRes.status }
            );
        }

        // forward the NEW cookie Express just issued
        const response = NextResponse.json(data);
        const setCookieHeader = backendRes.headers.get("set-cookie");
        if (setCookieHeader) {
            response.headers.set("set-cookie", setCookieHeader)
        }
        return response
    }catch (error) {
        console.error("Logout proxy error:", error); // ADD THIS
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}