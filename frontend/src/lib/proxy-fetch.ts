export async function proxyFetch(request: Request, path: string, options: RequestInit = {}) {
    const cookieHeader = request.headers.get("cookie") || "";

    const headers = new Headers(options.headers);
    headers.set("Cookie", cookieHeader);
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
    }
    return fetch(`${process.env.NODE_API_URL}${path}`, {
        ...options,
        headers,
    })
}

