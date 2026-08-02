import { Check, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "completed" | "current" | "upcoming" | "failed"

export interface TimelineStep {
    id: string;
    label: string;
    status: StepStatus;
    timestamp?: string;
}

interface OrderStatusTimelineProps {
    steps: TimelineStep[];
    variant?: "line" | "boxes";
    orientation?: "horizontal" | "vertical";
}

const dotStyles: Record<StepStatus, string> = {
    completed: "bg-green-500 text-white",
    current: "bg-blue-500 text-white animate-pulse",
    upcoming: "bg-muted text-muted-foreground",
    failed: "bg-red-500 text-white",
}

const boxStyles: Record<StepStatus, string> = {
    completed: "border-green-500 bg-green-50 test-green-700",
    current: "border-blue-500 bg-blue-50 test-blue-700",
    upcoming: "border-muted bg-muted/30 test-muted-foreground",
    failed: "border-red-500 bg-red-50 test-red-700",
}

export function OrderStatusTimeline({
    steps,
    variant = "line",
    orientation = "horizontal"
}: OrderStatusTimelineProps) {
    const isVertical = orientation === "vertical";
     
    // --- Boxes variant ---
    if (variant === "boxes") {
        return (
            <div className={cn("flex gap-2", isVertical ? "flex-col" : "flex-row flex-wrap")}>
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn("border rounded-md px-3 py-2 text-sm", boxStyles[step.status])}
                    >
                        <div className="font-medium">{step.label}</div>
                        {step.timestamp && (
                            <div className="text-xs opacity-70">{step.timestamp}</div>
                        )}
                    </div>
                ))}
            </div>
        );
    }
    
    // --- Line variant ---
    return (
        <div className={cn("flex w-full", isVertical ? "flex-col" : "flex-row items-start justify-between")}>
            {steps.map((step, i) => {
                const isLast = i === steps.length - 1;

                return (
                    <div 
                        key={step.id}
                        className={cn(
                            "flex relative", 
                            isVertical ? "flex-row gap-3 min-h-18 mx-10" : "flex-col items-center flex-1"
                        )}
                    >
                        {/* Dot & Line Container */}
                        <div className={cn("flex items-center", isVertical ? "flex-col h-full" : "w-full justify-center")}>
                            
                            {/* Connector Line (Renders BEFORE the dot visually on horizontal, or AFTER on vertical) */}
                            {!isLast && (
                                <div
                                    className={cn(
                                        "absolute bg-muted",
                                        isVertical 
                                            ? "w-0.5 h-[calc(100%-1.5rem)] top-6 left-3" 
                                            : "h-0.5 w-[calc(100%-2rem)] left-[calc(50%+1rem)] top-2.75"
                                    )}
                                    style={{
                                        // Dynamic color based on completion status
                                        backgroundColor: step.status === "completed" ? "var(--color-green-500, #22c55e)" : undefined
                                    }}
                                />
                            )}

                            {/* Step Dot */}
                            <div className={cn(
                                "flex items-center justify-center rounded-full w-6 h-6 shrink-0 z-10", 
                                dotStyles[step.status]
                            )}>
                                {step.status === "completed" && <Check className="w-3.5 h-3.5"/>}
                                {step.status === "current" && <Circle strokeWidth={3} className="w-3.5 h-3.5"/>}
                                {step.status === "failed" && <X className="w-3.5 h-3.5"/>}
                            </div>
                        </div>

                        {/* Label + Timestamp */}
                        <div className={cn(
                            "text-xs flex flex-col", 
                            isVertical ? "pt-1" : "mt-2 text-center px-2"
                        )}>
                            <div className="font-semibold text-foreground">{step.label}</div>
                            {step.timestamp && (
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                    {step.timestamp}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}