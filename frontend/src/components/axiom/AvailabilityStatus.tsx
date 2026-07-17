import { cn } from "@/lib/utils";


interface AvailabilityStatusProps {
    isOnline: boolean;
    responseTime: string;
}

export function AvailabilityStatus({ isOnline, responseTime }: AvailabilityStatusProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-muted-foreground/40")} />
            <span className={cn(isOnline ? "text-green-500" : "text-muted-foreground")}>
                {isOnline ? "Online now" : "Offline"}
            </span>
            <div className="text-muted-foreground">· {responseTime}</div>
        </div>
    )
}