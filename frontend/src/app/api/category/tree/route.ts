import { proxyFetch } from "@/lib/proxy-fetch";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    try {
        const backendRes = await proxyFetch(request, "/api/category/tree", {
            method: "GET"
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || errorData.message || "Failed to fetch category tree" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json(data);
    } catch(error) {
        console.log(new Date(),"-> [from FE Catgeory Tree]: Sent to BE")
        return NextResponse.json( { error: "Internal Server Error" }, { status: 500 } )
    }
}