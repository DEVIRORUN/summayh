export async function getSellerByUsername(sellerUsername: string) {
    const baseUrl = process.env.NODE_API_URL || "http://127.0.0.1:3001";
    const url = `${baseUrl}/api/seller/username/${sellerUsername}`;

    console.log("[getSellerByUsername] Fetching:", url);

    try {
        const res = await fetch(url, { cache: "no-store" });
        console.log("[getSellerByUsername] Status:", res.status);

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.log("[getSellerByUsername] Error body:", text);
            return null;
        }

        const data = await res.json();
        
        return data.sellerProfile ?? data;
    } catch (err) {
        console.error("[getSellerByUsername] Network error:", err);
        return null;
    }
}