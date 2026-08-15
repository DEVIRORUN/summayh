export async function getSellerByUsername(sellerUsername: string) {
    const res = await fetch(`${process.env.NODE_API_URL}/api/seller/username/${sellerUsername}`, {
        cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.sellerProfile;
}