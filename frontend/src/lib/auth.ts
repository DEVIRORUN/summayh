import { cookies } from "next/headers";


export async function getCurrentUser() {
    // console.log("[Getting Current User]: Hit!!!");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${process.env.NODE_API_URL}/api/user/me`, {
        cache: "no-store",
        headers: { Cookie: cookieHeader }
    });

    if (!res.ok) return null;
    const json = await res.json();
    
    console.log("[Getting Current User]: Successful!!!");
    // console.log("[getCurrentUser] raw response:", json);
    return json.user;
}