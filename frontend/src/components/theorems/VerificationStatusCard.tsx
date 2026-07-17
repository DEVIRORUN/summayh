import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerficationStatusCardProps {
    status: VerificationStatus;
    progress: number; // 0-100, e.g. "2 of 3 documents uploaded"
    onStartVerification: () => void;
}

const verificationCopy: Record<VerificationStatus, { title: string; description: string }> = {
    unverified: { title: "Get verified", description: "Verify your identity to unlock withdrawals." },
    pending: { title: "Verified pending", description: "We're reviewing your documents." },
    verified: { title: "Verified", description: "Your identity has been confirmed." },
    rejected: { title: "Verification failed", description: "Please resubmit your documents.." },
}

export function VerificationStatusCard({ status, progress, onStartVerification }: VerficationStatusCardProps) {
    const copy = verificationCopy[status];

    return (
        <Card className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                {status === "verified"  && <CheckCircle className="w-5 h-5 text-green-500"/>}
                {status === "rejected"  && <XCircle className="w-5 h-5 text-red-500"/>}
            </div>
            <p className="text-sm text-muted-foreground">{copy.description}</p>

            {status === "pending" && <Progress value={progress} />}

            {(status === "unverified" || status === "rejected") && (
                <Button size="sm" onClick={onStartVerification}>
                    {status === "rejected" ? "Resubmit documents" : "Start verification"}
                </Button>
            )}
        </Card>
    )
}