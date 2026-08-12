import { cn } from "@/lib/utils";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getDashboardData() {
    try {
        const cookieStore = await cookies();
        const res = await fetch(`${process.env.NODE_API_URL}/api/admin/dashboard`, {
            headers: { cookie: cookieStore.toString() },
            cache: "no-store"
        });
    
        const json = await res.json().catch(() => ({}));
    
        if (!res.ok) {
            console.error("[ADMIN DASHBOARD ERROR]:", json.error || json.message || "Failed to fetch dashboard data");
            return null;
        }
    
        console.log("[RESPONSE]:", json);
        return json.data ?? null;
    } catch (err) {
        console.error("[ADMIN DASHBOARD] fetch failed:", err);
        return null;
    }
}

function formatNaira(n: number) {
    return `₦${n.toLocaleString("en-NG")}`
}

export default async function AdminDashboardPage() {
    const data = await getDashboardData();

    if (!data) {
        redirect("/");
    }

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total Users" value={data.totalUsers} />
                <StatCard label="Active Gigs" value={data.activeGigs} />
                <StatCard label="Orders This Month" value={data.ordersThisMonth} />
                <StatCard label="Revenue (Commission)" value={formatNaira(data.totalRevenue)} />
                <StatCard label="Open Disputes" value={data.ordersThisMonth} highlight={data.openDisputes > 0}/>
            </div>

            <section>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Top 5 Sellers</h2>
                <div className="border border rounded-xs overflow-hidden">
                    <table className="w-full text-sm font-mono">
                        <thead className="bg-muted text-left">
                            <tr>
                                <th className="p-2">Seller</th>
                                <th className="p-2">Reviews</th>
                                <th className="p-2">Rating</th>
                                <th className="p-2">Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top5sellers.map((s: any) => (
                                <tr key={s.id} className="border-t border-border">
                                    <td className="p-2">
                                        <div className="font-medium">{s.name}</div>
                                        <div className="text-sm text-muted-foreground">@{s.username ?? "no-username"}</div>
                                    </td>
                                    <td className="p-2">{s.totalReviews}</td>
                                    <td className="p-2">{s.totalReviews}</td>
                                    <td className="p-2 text-xs text-muted-foreground">
                                        {s.email}
                                        {s.phoneNumber && <div>{s.phoneNumber}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="flex gap-4 text-xs font-mono">
                <Link href="/admin/disputes">View disputes →</Link>
                <Link href="/admin/sesison-disputes" className="underline">View session disputes →</Link>
                <Link href="/admin/no-result-queries" className="underline">View unmet search demand →</Link>
                <Link href="/admin/agent-decisions" className="underline">View disputes →</Link>
            </div>
        </main>
    )
}


function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean  }) {
    return (
        <div className={cn("border rounded-xs bg-card p-4", highlight ? "border-destructive/40 bg-destructive/5" : "border-border")}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-semibold", highlight ? "text-destructive" : "")}>{value}</p>
        </div>
    )
}