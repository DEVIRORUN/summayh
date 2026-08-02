import { NextResponse } from "next/server";

console.log("NODE_API_URL:", process.env.NODE_API_URL)

export async function GET(request: Request) {
    try {
        // 1. Grab the browser's cookies containing JWT/session token
        const cookieHeader = request.headers.get("cookie") || "";

        // 2. Foward the GET request to your Node backend(specific route api/user/me)
        const backendRes = await fetch(`${process.env.NODE_API_URL}/api/user/me`, {
            method: "GET",
            headers: {
                "Cookie": cookieHeader,
                "Content-Type": "application/json",
            },
        });

        // 3. If the user isn't logged in (cookie expired or missing)
        if(!backendRes.ok) {
            return NextResponse.json({ user: null }, { status: backendRes.status })
        }

        const data = await backendRes.json();

        // 4. Return user payload back to React Auth State
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ user: null, error: "Backend unreachable" }, { status: 500 })
    }
}