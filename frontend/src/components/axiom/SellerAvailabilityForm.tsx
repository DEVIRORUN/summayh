"use client";

import { Days_One } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";


interface TimeBlock {
    id: string;
    startTime: string;
    endTime: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function toMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

export default function SellerAvailabilityForm({ onSaved }: { onSaved?: () => void }) {
    const [schedule, setSchedule] = useState<Record<number, TimeBlock[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const endTimeRefs = useRef<Record<string, HTMLInputElement | null>>({});

    function addBlock(day: number) {
        setSchedule((prev) => ({
            ...prev,
            [day]: [
                ...(prev[day] || []),
                { id: crypto.randomUUID(), startTime: "09:00", endTime: "09:30" }
            ]
        }));
    }

    function removeBlock(day: number, id: string) {
        setSchedule((prev) => ({
            ...prev,
            [day]: prev[day].filter((b) => b.id !== id),
        }))
    }

    function updateBlock(day: number, id: string, field: "startTime" | "endTime", value: string) {
        setSchedule((prev) => ({
            ...prev,
            [day]: prev[day].map((b) => (b.id === id ? { ...b, [field]: value } : b)),
        }));
    }

    function validate(): string | null {
        for (const dayStr of Object.keys(schedule)) {
            const day = Number(dayStr);
            const blocks = [...schedule[day]].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                const dur = toMinutes(b.endTime) - toMinutes(b.startTime);
                if (dur < 30) {
                    return `${DAYS[day]}: each block must be at least 30 minutes.`
                }
                if (i > 0) {
                    const prev = blocks[i - 1];
                    if (toMinutes(b.startTime) < toMinutes(prev.endTime)) {
                        return `${DAYS[day]}: time blocks cannot overlap.`;
                    }
                }
            }
        }
        return null;
    }

    async function handleSubmit() {
        setError(null);
        const validationError = validate();
        if (validationError) return setError(validationError);

        const payload = Object.entries(schedule).flatMap(([day, blocks]) => 
            blocks.map((b) => ({
                dayOfWeek: Number(day),
                startTime: b.startTime,
                endTime: b.endTime,
            })),
        );

        if (payload.length === 0) return setError("Add at least one available time block")

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/seller/availability", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availability: payload }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save avaialability.");
            }
            setJustSaved(true);
            onSaved?.()
            setTimeout(() => setJustSaved(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong" );
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        async function loadAvailability() {
            try {
                const res = await fetch("/api/seller/availability");
                if (!res.ok) return;
                const { data } = await res.json();

                const grouped: Record<number, TimeBlock[]> = {};
                for (const row of data) {
                    if (!grouped[row.dayOfWeek]) grouped[row.dayOfWeek] = [];

                    grouped[row.dayOfWeek].push({
                        id: row.id ?? crypto.randomUUID(),
                        startTime: row.startTime,
                        endTime: row.endTime
                    })
                }
                setSchedule(grouped);
            } catch (err) {
                console.error("Failed to load availability:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadAvailability();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-row gap-6 min-w-0 animate-pulse">
                {/* editor skeleton */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    {DAYS.map((_, day) => (
                    <div key={day} className="border border-border rounded-xs p-2 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                        <div className="h-3 w-8 bg-muted rounded-xs" />
                        <div className="h-3 w-16 bg-muted rounded-xs" />
                        </div>
                        <div className="h-6 w-40 bg-muted rounded-xs" />
                    </div>
                    ))}
                    <div className="h-8 w-32 bg-muted rounded-md" />
                </div>

                {/* preview skeleton */}
                <div className="w-[240px] shrink-0 border border-border rounded-xs p-3">
                    <div className="h-3 w-24 bg-muted rounded-xs mb-3" />
                    <div className="flex flex-col gap-1">
                    {DAYS.map((_, day) => (
                        <div key={day} className="flex items-center gap-2">
                        <div className="h-2.5 w-7 bg-muted rounded-xs shrink-0" />
                        <div className="flex-1 h-3 bg-muted rounded-xs" />
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-row gap-6 min-w-0">
            {/* editor */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
                {DAYS.map((label, day) => (
                    <div key={day} className="border border-border rounded-xs p-2 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold">{label}</span>
                            <Button
                                type="button"
                                onClick={() => addBlock(day)}
                                className="bg-unset text-xs underline cursor-pointer text-muted-foreground"
                            >
                                + Add time
                            </Button>
                        </div>
                        {(schedule[day] || []).map((b) => (
                            <div key={b.id} className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    step={1800}
                                    value={b.startTime}
                                    onChange={(e) => updateBlock(day, b.id, "startTime", e.target.value)}
                                    onKeyDown={(e) => {
                                        if(e.key === "Enter") {
                                            e.preventDefault();
                                            endTimeRefs.current[b.id]?.focus();
                                        }
                                    }}
                                    className="text-xs border rounded-xs px-1 py-0.5"
                                />
                                <span className="text-xs text-muted-foreground">to</span>
                                <Input
                                    type="time"
                                    step={1800}
                                    ref={(el) => { endTimeRefs.current[b.id] = el; }}
                                    value={b.endTime}
                                    onChange={(e) => updateBlock(day, b.id, "endTime", e.target.value)}
                                    className="text-xs border rounded-xs px-1 py-0.5"
                                />
                                <Button type="button" onClick={() => removeBlock(day, b.id)} className="rounded-xs cursor-pointer">
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ))}
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={cn(
                                "rounded-md cursor-pointer w-fit rounded-xs",
                                justSaved ? "bg-green-600 hover:bg-green-600 " : "bg-muted-foreground hover:bg-foreground ",
                                isSubmitting && "animate-pulse"
                            )}
                        >
                            {isSubmitting ? "Saving..." : justSaved ? "Saved ✓ " : "Save availability"}
                        </Button>

                    <div className={cn(
                        "w-[240px] shrink-0 border border-border rounded-xs p-3 shadow-xs transition-all duration-300",
                        justSaved ? "bg-muted/50" : "")}>
                        <span className="text-xs font-semibold">Weekly preview</span>
                        <div className="flex flex-col gap-1 mt-2">
                            {DAYS.map((label, day) => (
                                <div key={day} className="flex items-center gap-2">
                                    <span className="text-[10px] w-7 text-muted-foreground">{label}</span>
                                    <div className="relative flex-1 h-3 bg-muted rounded-xs overflow-hidden rounded-sm">
                                        {(schedule[day] || []).map((b) => {
                                            const left = (toMinutes(b.startTime) / 1440) * 100;
                                            const width = ((toMinutes(b.endTime) - toMinutes(b.startTime)) / 1440) * 100;
                                            return (
                                                <div 
                                                    key={b.id}    
                                                    className="absolute top-0 h-full bg-foreground transition-all duration-300 ease-out rounded-r-md rounded-l-sm"
                                                    style={{ left: `${left}%`, width: `${width}%` }}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
            </div>
        </div>
    )
}