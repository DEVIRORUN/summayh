"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DraftGig } from "@/types/draftGig";

interface LivePricingGigPageProps {
  gigId: string;
  draft: DraftGig;
  refetchDraft: () => Promise<void>
}

export default function LivePricingGigPage({ gigId, draft, refetchDraft }: LivePricingGigPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const findTier = (label: "BASIC" | "STANDARD" | "PREMIUM") => 
  draft.tiers?.find(t => t.label === label);

  const seedTier = (label: "BASIC" | "STANDARD" | "PREMIUM") => {
    const t = findTier(label);
    return {
      customName: t?.customName ?? "",
      description: t?.description ?? "",
      price: t?.price ?? 0,
      sessionLengthMin: t?.sessionLengthMin ?? 30,
      breakLengthMin: t?.breakLengthMin ?? 5,
      totalSessions: t?.totalSessions ?? 1,
    }
  }

  const [tiers, setTiers] = useState({
    basic: seedTier("BASIC"),
    standard: seedTier("STANDARD"),
    premium: seedTier("PREMIUM"),
  });

  const validateTiers = (): string | null => {
    const tierKeys = ["basic", "standard", "premium"] as const;

    for (const key of tierKeys) {
      const tier = tiers[key];
      const name = key.toUpperCase();
      if (!tier.customName.trim()) return `Please enter a custom title for the ${name} package.`;
      if (!tier.description.trim()) return `Please enter a custom description for the ${name} package.`;
      if (tier.price <= 0) return `Price for ${name} package must be greater than 0.`;
      if (!tier.sessionLengthMin || tier.sessionLengthMin <= 0) return `Please select a session length for the ${name} package.`;
      if (!tier.totalSessions || tier.totalSessions <= 0) return `Please select total sessions for the ${name} package.`;
    }
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validateTiers();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gig/${gigId}/tiers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Failed to save tiers.");
      }

      await refetchDraft();
      router.push(`/gigs/new/${gigId}/requirements`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function formatNaira(v: number): string {
    if (!v) return "";
    return v.toLocaleString("en-NG");
  }

  function parseNaira(i: string): number {
    const digitsOnly = i.replace(/[^0-9]/g, "");
    return digitsOnly ? Number(digitsOnly) : 0;
  }

  const SESSION_LENGTH_OPTIONS = [15, 30, 45, 60, 90];
  const BREAK_OPTIONS = [0, 5, 10, 15];
  const TOTAL_SESSIONS_OPTIONS = [1, 2, 3, 4, 5, 8, 10];

  const updateTier = (
    tierName: "basic" | "standard" | "premium",
    field: string,
    value: string | number,
  ) => {
    setTiers((prev) => ({
      ...prev,
      [tierName]: { ...prev[tierName], [field]: value },
    }));
  };
  return (
    <main className="text-muted-foreground min-w-0 ">
      <div className="top flex flex-row justify-between">
        <span className="font-semibold text-2xl">Scope & Pricing</span>
        <div className="flex flex-c">
          <span className="text-xs">Offer packages</span>
          {/* Toggle button - ADDED TO TODO, RN all 3 tiers are compulsory */}
        </div>
      </div>
      <hr className="border-border my-4" />
      <div className="canvas">
        <span className="text-xs font-semibold">Packages</span>
        <div className="grid grid-cols-[160px_1fr_1fr_1fr] min-w-0 border border-border p-0">
          <div />
          {["BASIC", "STANDARD", "PREMIUM"].map((t) => (
            <div
              key={t}
              className="h-7 px-2 border bg-muted font-semibold text-xs flex items-center"
            >
              {t}
            </div>
          ))}

          <div />
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Input
              key={tierName}
              value={tiers[tierName].customName}
              onChange={(e) =>
                updateTier(tierName, "customName", e.target.value)
              }
              className="rounded-none text-xs min-h-10"
              placeholder="What's the vibe? Name it"
            />
          ))}

          <div />

          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Textarea
              key={tierName}
              value={tiers[tierName].description}
              onChange={(e) =>
                updateTier(tierName, "description", e.target.value)
              }
              className="rounded-none text-xs min-h-16"
              placeholder="Drop the details"
            />
          ))}

          <span className="text-xs p-2 flex align-end">Session Length</span>
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Select
              key={tierName}
              //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
              onValueChange={(v) =>
                updateTier(tierName, "sessionLengthMin", Number(v))
              }
            >
              <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                <SelectValue
                  className="truncate min-w-0"
                  placeholder="Select length"
                />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                {SESSION_LENGTH_OPTIONS.map((m) => (
                  <SelectItem
                    className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                    key={m}
                    value={String(m)}
                  >
                    {m} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <span className="text-xs p-2 flex align-end">Break Between</span>
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Select
              key={tierName}
              //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
              onValueChange={(v) =>
              updateTier(tierName, "breakLengthMin", Number(v))
              }
            >
              <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                <SelectValue
                  className="truncate min-w-0"
                  placeholder="SELECT"
                />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                {BREAK_OPTIONS.map((m) => (
                  <SelectItem
                    className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                    key={m}
                    value={String(m)}
                  >
                    {m} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <span className="text-xs p-2 flex align-end">Total Sessions</span>
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Input
              type="number"
              key={tierName}
              min={1}
              max={1000}
              value={tiers[tierName].totalSessions || ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                   updateTier(tierName, "totalSessions", 0)
                   return;
                }
                const val = Number(raw);
                if (!isNaN(val)) {
                  updateTier(tierName, "totalSessions", Math.min(Math.max(val, 1), 1000))
                }
              }}
              placeholder="e.g. 10, up to 700 for full course"
              className="rounded-none text-xs h-10"
            />
          ))}

          <div className="text-xs self-center border rounded-none bg-card h-10 flex items-center px-2">
            Price (₦)
          </div>
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Input
              type="text"
              inputMode="numeric"
              key={tierName}
              value={formatNaira(tiers[tierName].price)}
              onChange={(e) =>
                updateTier(tierName, "price", parseNaira(e.target.value))
              }
              className="rounded-none text-xs h-10"
            />
          ))}
        </div>
      </div>
      <div className="flex w-full">
        {error && <p className="text-xs text-destructive px-2">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="cursor-pointer m-2 ml-auto rounded-sm bg-muted-foreground hover:bg-foreground"
        >
         {isSubmitting ? "Saving..." : "Next & Submit" }
        </Button>
      </div>
    </main>
  );
}