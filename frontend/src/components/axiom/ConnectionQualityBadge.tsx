import { ConnectionQuality } from "livekit-client";
import { cn } from "@/lib/utils";

interface Props {
    quality: ConnectionQuality;
    variant: "pc" | "mobile";
}


export default function ConnectionQualityBadge({ quality, variant = "pc" }: Props) {
    const config = {
        [ConnectionQuality.Excellent]: { label: "Excellent", color: "bg-emerald-500", bars: 3 },
        [ConnectionQuality.Good]: { label: "Good", color: "bg-amber-500", bars: 2 },
        [ConnectionQuality.Poor]: { label: "Poor connection", color: "bg-red-500", bars: 1 },
        [ConnectionQuality.Lost]: { label: "Connection lost", color: "bg-red-700", bars: 0 },
        [ConnectionQuality.Unknown]: { label: "Connecting...", color: "bg-slate-500", bars: 0 },
    }[quality];


    return (
        <div className="flex items-center gap-1.5 text-xs text-white/80 px-2 py-1 rounded-full">
            <div className="flex items-end gap-0.5 h-3">
                {[1, 2, 3].map((bar) => (
                    <div
                        key={bar}
                        className={`w-1 rounded-sm ${bar <= config.bars ? config.color : "bg-white/20"}`}
                        style={{ height: `${bar * 4}px` }}
                    />
                ))}
            </div>
            <span className={cn("", variant === "mobile" ? "text-xs" : "")}>{config.label}</span>
        </div>
    )
}