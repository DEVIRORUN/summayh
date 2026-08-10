"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

interface Slot {
    start: string;
    end: string;
}
function groupByPeriod(slots: Slot[]) {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];''

    for (const slot of slots) {
        const hour = new Date(slot.start).getHours();
        if (hour < 12) morning.push(slot);
        else if (hour < 17) afternoon.push(slot);
        else evening.push(slot);
    }

    return { morning, afternoon, evening }
}

function toLocaleDateString(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`
}

export function SlotPicker({
    sellerId,
    sessionLengthMin,
    onSelect,
} : {
    sellerId: string;
    sessionLengthMin: number;
    onSelect: (slot: Slot) => void;
}) {
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setDate(toLocaleDateString(new Date()))
    }, []);

    useEffect(() => {
        async function loadSlots() {
            setIsLoading(true);
            setSelectedSlot(null);
            try {
                const res = await fetch(
                    `/api/seller/${sellerId}/available-slots?date=${date}&sessionLengthMin=${sessionLengthMin}`
                );
                if (!res.ok) return;
                const { data } = await res.json();
                setSlots(data || []);
            } catch {
                setSlots([])
            } finally {
                setIsLoading(false);
            }
        }
        loadSlots();
    }, [sellerId, date, sessionLengthMin]);

    const  { morning, afternoon, evening } = groupByPeriod(slots);

    function renderGroup(label: string, group: Slot[]) {
        if (group.length === 0) return null;
        return (
            <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className="grid grid-cols-3 gap-1.5">
                    {group.map((slot) => {
                        const isSelected = selectedSlot?.start === slot.start;
                        return (
                            <Button
                                key={slot.start}
                                type="button"
                                onClick={() => {
                                    setSelectedSlot(slot);
                                    onSelect(slot);
                                }}
                                className={cn(
                                    "text-xs border rounded-xs py-1.5 cursor-pointer transition-colors",
                                    isSelected
                                        ? "bg-foreground text-background border-foreground"
                                        : "border-border hover:border-muted-foreground hover:bg-muted"
                                )}
                            >
                                {new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Button>
                        )
                    })}
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-3 border border-border rounded-md p-3">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold">Pick your first session</span>
                <Input
                    type="date"
                    value={date}
                    min={toLocaleDateString(new Date())}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs border border-border rounded-xs px-2 py-1 w-fit"
                />

                {isLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                        <Loader2 className="h-3 w-3 animate-spin"/>
                        Checking availability
                    </div>
                ) : slots.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No available slots on this date.</p>
                ) : (
                    <div className="flex flex-wrap gap-1">
                        {renderGroup("Morning", morning)}
                        {renderGroup("Afternoon", afternoon)}
                        {renderGroup("Evening", evening)}
                    </div>
                )}

                {selectedSlot && (
                    <div className="text-xs bg-muted rounded-xs px-2 py-1 5 flex items-center justify-between">
                        <span>
                            <span className="font-medium">Selected:</span> {new Date(selectedSlot.start).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                            {" · "}
                            {new Date(selectedSlot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}