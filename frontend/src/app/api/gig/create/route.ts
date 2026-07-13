import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        // 1. extract the JSON body typed by the user in page
        const body = await request.json();

        // 2. Grab cookie header
        const cookieHeader = request.headers.get("cookie") || "";

        // 3. Foward it securely to Node system
        const backendRes = await fetch(`${process.env.NODE_API_URL}/api/gig/create`, {
            method: "POST",
            headers: {
                "Cookie": cookieHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        // 4. Node error, logs
        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || "Failed to create gig" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        // 5. Success! Return
        return NextResponse.json(data);
    } catch(error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}