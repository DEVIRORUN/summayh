"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankInput } from "../shared/BankSearchHandler";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

import { SETTLEMENT_BANK_CODES as banks } from "@/data/banks";

interface WithdrawDialogProps {
    available: string;
    hasRecipientCode?: boolean;
}

export function WithdrawDialog({ available, hasRecipientCode = false }: WithdrawDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const [bankName, setBankName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [bankError, setBankError] = useState<string | null>(null);

    const [accountName, setAccountName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit() {
        setError(null);
        const numericAmount = Number(amount);

        if (!numericAmount || numericAmount <= 0) {
            setError('Enter a valid amount');
            return;
        }

        if (numericAmount > Number(available)) {
            setError("Amount exceeds available balance.");
            return;
        }

        if (!hasRecipientCode && (!accountNumber || !bankCode || !accountName)) {
            setError("Bank details are required for your first withdrawal.")
            return;
        }

        // No wfinally run it
        setLoading(true);
        try {
            const res = await fetch("/api/payment/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: numericAmount,
                    bankDetails: hasRecipientCode ? undefined : { accountNumber, bankCode, accountName }
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Withdrawal failed.");
                return;
            }

            setOpen(false);
            setAmount("");
            router.refresh();
        } catch (err) {
            setError("Something went wrong.")
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild> 
                <Button className="bg-foreground hover:bg-muted-foreground rounded-sm cursor-pointer">Withdaraw</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <Label>Amount (₦)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Available: ${Number(available).toLocaleString("en-NG", { style: "currency", currency: "NGN" })}`}
                        />
                    </div>

                    {!hasRecipientCode && (
                        <>
                            <div className="flex flex-col gap-1">
                                <Label>Account Number</Label>
                                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}/>
                            </div>
                            <div className="flex flex-col gap-1">
                                {/* <Label>Bank</Label> */}
                                <BankInput 
                                    inputValue={bankName}
                                    onInputChange={setBankName}
                                    onBankSelect={setBankCode}
                                    error={bankError}
                                    onErrorChange={setBankError}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label>Account Name</Label>
                                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)}/>
                            </div>
                        </>
                    )}

                    {error && <span className="text-sm text-destructive">{error}</span>}
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading} className="cursor-pointer">
                        {loading ? "Processing..." : "Confirm Withdrawal"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}