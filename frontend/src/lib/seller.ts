export async function getSellerByUsername(sellerUsername: string) {
    const url = `${process.env.NODE_API_URL}/api/seller/username/${sellerUsername}`;
    console.log("[getSellerByUsername] NODE_API_URL raw:", process.env.NODE_API_URL);
    console.log("[getSellerByUsername] Fetching:", url);
    const res = await fetch(url, { cache: "no-store" });
    console.log("[getSellerByUsername] Status:", res.status);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("[getSellerByUsername] Error body:", text);
        return null;
    }
    const data = await res.json();
    return data.sellerProfile;
}