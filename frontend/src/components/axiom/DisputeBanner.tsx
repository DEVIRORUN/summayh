import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";



interface DisputeBannerProps {
    reason: string;
    raisedBy: "buyer" | "seller" | "system";
    onViewDetails?: () => void;
}


export function DisputeBanner({ reason, raisedBy, onViewDetails }: DisputeBannerProps) {
    return (
        <Alert variant="destructive" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4"/>
                <div>
                    <AlertTitle>Order Disputed</AlertTitle>
                    <AlertDescription>{reason} - flagged by {raisedBy}</AlertDescription>
                </div>
            </div>
            {onViewDetails && <Button size="sm" variant="outline" onClick={onViewDetails}>View Details</Button>}
        </Alert>
    )
}