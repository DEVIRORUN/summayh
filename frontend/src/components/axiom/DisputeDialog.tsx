"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useState } from "react";


interface DisputeDialogProps {
    orderId: string;
    bookingId?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ORDER_REASONS = [
    { value: "WORK_NOT_DELIVERED", label: "Work not delivered" },
    { value: "WORK_NOT_AS_DESCRIBED", label: "Not as described" },
    { value: "SELLER_UNRESPONSIVE", label: "Seller unresponsive" },
    { value: "QUALITY_ISSUES", label: "Quality issues" },
    { value: "OTHER", label: "Other" },
];

const SESSION_REASONS = [
    { value: "SELLER_NO_SHOW", label: "Seller didn't show up" },
    { value: "LEFT_EARLY", label: "Seller left the session early" },
    { value: "TECHNICAL_ISSUES", label: "Technical/connection issues" },
    { value: "QUALITY_ISSUES", label: "Quality of the session" },
    { value: "OTHER", label: "Other" },
];


export function DisputeDialog({ orderId, bookingId, open, onOpenChange }: DisputeDialogProps) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const reasons = bookingId ? SESSION_REASONS : ORDER_REASONS;

    async function handleSubmit() {
        if (!reason) {
            setError("Please select a reason.");
            return;
        }
        if(!description.trim() || description.trim().length < 10) {
            setError("Please describe the issue in a bit more detail.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            const url = bookingId
                ? `/api/session-disputes/${bookingId}`
                : `/api/orders/${orderId}/dispute`;

            const body = bookingId
                ? { reason, description }
                : { orderId, reason, description, evidenceUrls: [] }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Failed to submit dispute")
            }
            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                window.location.reload()
            }, 1200);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {!bookingId && (
                <DialogTrigger asChild>
                    <Button variant="outline" className="cursor-pointer text-destructive border-destructive/40 hover:bg-destructive/10">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                        Open Dispute
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{bookingId ? "Report an issue with this sesison" : "Open a dispute"}</DialogTitle>
                </DialogHeader>

                {success ? (
                    <p className="text-sm text-success py-6">
                        {bookingId ? "Session dispute submitted." : "Dispute opened. This order is now frozen pending review."}
                    </p>
                ) : (
                    <div className="flex flex-col gap-3 py-2">
                        <Select onValueChange={setReason}>
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Textarea
                            placeholder="What really happend?"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value) }
                            className="text-sm"
                        />

                        {error && <p className="text-xs text-destructive">{error}</p>}

                        <p className="text-xs text-muted-foreground">
                            {bookingId
                                ? "This flags the session for admin review. It won't freeze your other sesisons."
                                : "This will freeze ther order until an admin reviews it. Refunds/payouts are put on hold."}
                        </p>
                    </div>
                )}

                {!success && (
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="cursor-pointer">
                            {isSubmitting ? (
                                <span className="flex items-center gap-1.5">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                                </span>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}