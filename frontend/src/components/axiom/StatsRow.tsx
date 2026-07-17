import { ReactNode } from "react";
import { cn } from "@/lib/utils";


interface Stat {
    label: string; // from db
    value: string;
    icon?: ReactNode
}

interface StatsRowProps {
    stats: Stat[];
    layout: "row" | "grid"
}


export function StatsRow({ stats, layout }: StatsRowProps) {
    return (
        <div 
            className={cn(
                layout === "row"
                ? "flex flex-row gap-6 my-5"
                : "grid grid-cols-2 sm:grid-cols-3 gap-4 my-5"
        )}>
            {stats.map((stat, i) => (
                <div key={i}  className="flex items-center gap-2">
                    {stat.icon &&(
                        <div className="text-muted-foreground">{stat.icon}</div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{stat.value}</span>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}