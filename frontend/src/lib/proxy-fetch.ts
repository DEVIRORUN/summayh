export async function proxyFetch(request: Request, path: string, options: RequestInit = {}) {
    const cookieHeader = request.headers.get("cookie") || "";

    return fetch(`${process.env.NODE_API_URL}${path}`, {
        ...options,
        headers: {
            "Cookie": cookieHeader,
            "Content-type": "application/json",
            ...options.headers,
        }
    })
}

