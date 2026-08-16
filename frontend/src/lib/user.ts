export async function getUserByUsername(username: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/u/${username}`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        const body = await res.json();
        return body?.data ?? null;
    } catch (error) {
        console.error(`[getUserByUsername] Failed for ${username}:`, error);
        return null;
    }
}