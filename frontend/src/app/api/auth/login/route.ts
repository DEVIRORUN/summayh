import { NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await proxyFetch(request, "/api/auth/login", {
                method: "POST",
                body: JSON.stringify(body),
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
        console.error("Login proxy error:", error); // ADD THIS
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}