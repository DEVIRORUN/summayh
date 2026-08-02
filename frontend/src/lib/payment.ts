import { cookies } from "next/headers";

interface Balance {
    available: string;
    totalEarned: string;
    totalWithdrawn: string;
    pendingWithdrawals: string;
}

interface LedgerEntry {
    id: string;
    type: string;
    status: string;
    amount: string;
    description: string | null;
    createdAt: string;
    order?: { id: string; gigId: string } | null;
    withdrawal?: { id: string; status: string } | null;
}

export async function getBalance(): Promise<Balance | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/payment/balance`, {
            cache: "no-store",
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`)
            return null;
        }
        const json = await res.json();
        return json.data;
    } catch (err) {
        console.error("Fetched error:", err);
        return null;
    }
}

export async function getLedger(page: number = 1, limit: number = 20): Promise<{ data: LedgerEntry[]; meta: { total: number; page: number; limit: number; totalPages: number }} | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    try {
        const res = await fetch(`${process.env.NODE_API_URL}/api/payment/ledger?page=${page}&limit=${limit}`, {
            cache: "no-cache",
            headers: { Cookie: cookieHeader }
        });

        if (!res.ok) {
            console.error(`Fetch failed with status: ${res.status}`);
            return null;
        }

        const json = await res.json(); // Full data, meta
        return json.data;
    } catch (err) {
        console.error("Fetch error:", err)
        return null;
    }
}