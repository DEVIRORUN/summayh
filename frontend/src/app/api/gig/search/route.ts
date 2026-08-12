// import { NextResponse } from "next/server";
// import { proxyFetchRoute } from "@/lib/proxy-fetch";


// export async function GET(request: Request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const { query } = searchParams.get("q") || "";

//         const backendRes = await proxyFetchRoute(
//             request,
//             `/api/gigs/search?q=${encodeURIComponent(query)}`,
//             { method: "GET" }
//         )

//         if (!backendRes.ok) {
//             const errorData = await backendRes.json().catch(() => ({}));
//             return NextResponse.json(
//                 { error: errorData.message || "Search faield" },
//                 { status: backendRes.status }
//             );
//         }

//         const data = backendRes.json();
//         return NextResponse.json(data);
//     } catch(error) {
//         return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
//     }
// }



// src/app/api/gig/search/route.ts
import { NextResponse } from "next/server";
import { proxyFetchRoute } from "@/lib/proxy-fetch";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query = "", budgetMax, location } = body;

    const params = new URLSearchParams({ q: query });
    if (budgetMax) params.set("budgetMax", String(budgetMax));
    if (location) params.set("location", location);

    // Call your Express/Node backend
    const backendRes = await proxyFetchRoute(
      request,
      `/api/gig/search?${params.toString()}`,
      { method: "GET" }
    );

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Search failed" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}