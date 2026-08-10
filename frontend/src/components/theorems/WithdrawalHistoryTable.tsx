import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/axiom/EmptyState";
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "../ui/table";
import { PriceTag } from "@/components/axiom/PriceTag";
import { Badge } from "@/components/ui/badge";

interface WithdrawalRow {
    id: string;
    amount: number;
    destination: string;
    status: "pending" | "completed" | "failed";
    date: string;
}

interface WithdrawalHistoryTableProps {
    widthdrawals: WithdrawalRow[];
}

const withdrawalStatusStyles: Record<WithdrawalRow["status"], string> = {
    pending: "bg-slate-100 text-slate-100",
    completed: "bg-green-100 text-green-100",
    failed: "bg-red-100 text-red-100",
}

export function WithdrawalHistoryTable({ widthdrawals }: WithdrawalHistoryTableProps) {
    if (widthdrawals.length === 0) {
        return <EmptyState icon={<Wallet className="w-8 h-8"/>} title="No withdrawals yet"/>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {widthdrawals.map((w) => (
                    <TableRow key={w.id}>
                        <TableCell><PriceTag price={w.amount} size="sm"/></TableCell>
                        <TableCell>{w.destination}</TableCell>
                        <TableCell><Badge className={withdrawalStatusStyles[w.status]}>{w.status}</Badge></TableCell>
                        <TableCell>{w.date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}