export async function proxyFetchRoute(
    request: Request, 
    path: string, 
    options: RequestInit = {}
): Promise<Response> {
    const cookieHeader = request.headers.get("cookie") || "";
    const authHeader = request.headers.get("authorization") || "";

    const targetHeaders = new Headers(options.headers);

    if (cookieHeader) targetHeaders.set("Cookie", cookieHeader);
    if (authHeader && !targetHeaders.has("Authorization")) {
        targetHeaders.set("Authorization", authHeader);
    }
    if (!targetHeaders.has("Content-Type")) {
        targetHeaders.set("Content-Type", "application/json");
    }

    const url = `${process.env.NODE_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    console.log("[PROXY FETCH URL]:", url);
    return fetch(url, {
        cache: "no-store",
        ...options,
        headers: targetHeaders,
    })
}


export async function proxyFetchServer<T = any>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { cookies, headers } = await import("next/headers");
    const cookieStore = await cookies();
    const headerStore = await headers();

    const targetHeaders =  new Headers(options.headers);

    const cookieHeader = cookieStore.toString();
    const authHeader = headerStore.get("authorization");

    if (cookieHeader) targetHeaders.set("Cookie", cookieHeader);
    if (authHeader && !targetHeaders.has("Authorization")) {
        targetHeaders.set("Authorization", authHeader);
    }
    if (!targetHeaders.has("Content-Type")) {
        targetHeaders.set("Content-Type", "application/json");
    }
    const baseUrl = process.env.NODE_API_URL || "http://localhost:3001";

    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    // ADD THIS LOG:
    console.log("[PROXY FETCH DEBUG] Target URL:", url);

    const res = await fetch(url, {
        cache: "no-store",
        ...options,
        headers: targetHeaders,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `API error ${res.status}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
}
