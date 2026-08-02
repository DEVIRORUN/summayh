import { getBalance, getLedger } from "@/lib/payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WithdrawDialog } from "@/components/axiom/WithdrawDialog"
import { cn } from "@/lib/utils"




export default async function EarningsPage() {
    const [balance, ledger] = await Promise.all([getBalance(), getLedger()])

    if (!balance) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Could not load earnings.</div>
    }

    if (!ledger) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Could not load earnings.</div>
    }

    return (
        <div className="p-4 w-full min-w-0 flex flex-col gap-2">
            <header className="flex flex-row justify-between items-center">
                <span className="mb-3 flex items-center text-2xl font-semibold">Earnings</span>
                <WithdrawDialog available={balance.available} />
            </header>

            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Available</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{Number(balance.available).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Earned</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{Number(balance.totalEarned).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}</CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Withdrawn</CardTitle></CardHeader>
                    <CardContent className="text-2xl font-semibold">{Number(balance.totalWithdrawn).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}</CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-lg font-medium">Recent Activity</span>
                {!ledger || ledger.data.length === 0 ? (
                    <div className="text-muted-foreground">No transaction yet.</div>
                ) : (
                    ledger.data.map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center border-b py-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{entry.description || entry.type}</span>
                                <span className="text-sm text-muted-foreground">{
                                    new Date(entry.createdAt).toLocaleDateString()
                                }</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "", entry.type === "WITHDRAWAL" ? "text-red-500" : "text-green-600"
                                )}>
                                    {entry.type === "WITHDRAWAL" ? "-" : "+"}{Number(entry.amount).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}
                                </span>
                                <Badge variant={entry.status === "COMPLETED" ? "default" : entry.status === "FAILED" ? "destructive" : "secondary"}>
                                    {entry.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}