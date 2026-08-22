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

export default function DigitalPricingGigPage({ 
  gigId,
  draft,
  refetchDraft,
  }: { gigId: string, draft: DraftGig, refetchDraft: () => Promise<void> }) {
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
      deliveryDays: t?.deliveryDays ?? 1,
      revisionCount: t?.revisionCount ?? 0,
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

      if (!tier.customName.trim()) {
        return `Please enter a custom title for the ${name} package.`;
      }
      if (!tier.description.trim()) {
        return `Please enter a custom description for the ${name} package.`;
      }
      if (tier.price <= 0) {
        return `Price for ${name} package must be greater than 0.`;
      }
      if (!tier.deliveryDays || tier.deliveryDays <= 0) {
        return `Please select valid delivery days for the ${name} package.`;
      }
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

  const DELIVERY_OPTIONS = [1, 2, 3, 5, 7, 14];
  const REVISION_OPTIONS = [0, 1, 2, 3, 5];

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
      <div className="top flex flex-row justify-between items-center mb-4">
        <span className="font-semibold text-2xl">Scope & Pricing</span>
        <div className="flex flex-col text-right">
          <span className="text-xs">Offer packages</span>
          {/* Toggle button - ADDED TO TODO, RN all 3 tiers are compulsory */}
        </div>
      </div>
      <hr className="border-border my-4" />

      <div className="canvas space-y-4">
        <span className="text-xs font-semibold mb-2">Packages</span>
        {/* MOBILE VIEW */}
        <div className="grid md:hidden gap-6">
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <div key={tierName} className="shadow-xs border border-border p-4 space-y-2 rounded-md">
              <div className="font-bold text-sm uppercase tracking-wider border-b border-bordre pb-2">
                {tierName}
              </div>

              <div className="space-y-1">
                 <Input
                    key={tierName}
                    value={tiers[tierName].customName}
                    onChange={(e) =>
                      updateTier(tierName, "customName", e.target.value)
                    }
                    className="rounded-none text-xs min-h-10"
                    placeholder="What's the vibe? Name it"
                  />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Description</label>
                  <Textarea
                    key={tierName}
                    value={tiers[tierName].description}
                    onChange={(e) =>
                      updateTier(tierName, "description", e.target.value)
                    }
                    className="rounded-none text-xs min-h-16"
                    placeholder="Drop the details"
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 align-center">
                  <label className="text-xs font-semibold">Delivery</label>
                </div>
                <Select
                  key={tierName}
                  //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
                  onValueChange={(v) =>
                    updateTier(tierName, "deliveryDays", Number(v))
                  }
                >
                  <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                    <SelectValue
                      className="truncate min-w-0"
                      placeholder="Select delivery days"
                    />
                  </SelectTrigger>
                  <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                    {DELIVERY_OPTIONS.map((d) => (
                      <SelectItem
                        className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                        key={d}
                        value={String(d)}
                      >
                        {d} {d === 1 ? "Day" : "Days"} Delivery
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 align-center">
                  <label className="text-xs font-semibold">Revisions</label>
                </div>
                <Select
                    key={tierName}
                    //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
                    onValueChange={(v) =>
                      updateTier(tierName, "revisionCount", Number(v))
                    }
                  >
                    <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                      <SelectValue
                        className="truncate min-w-0"
                        placeholder="SELECT"
                      />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                      {REVISION_OPTIONS.map((d) => (
                        <SelectItem
                          className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                          key={d}
                          value={String(d)}
                        >
                          {d} {d === 1 ? "Revision" : "Revisions"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-semibold">
                    Price (₦)
                  </label>
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
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:grid grid-cols-[160px_1fr_1fr_1fr] min-w-0 border border-border p-0">
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

          <div />
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Select
              key={tierName}
              //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
              onValueChange={(v) =>
                updateTier(tierName, "deliveryDays", Number(v))
              }
            >
              <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                <SelectValue
                  className="truncate min-w-0"
                  placeholder="Select delivery days"
                />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                {DELIVERY_OPTIONS.map((d) => (
                  <SelectItem
                    className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                    key={d}
                    value={String(d)}
                  >
                    {d} {d === 1 ? "Day" : "Days"} Delivery
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <div className="text-xs p-2 flex align-end">Revision</div>
          {(["basic", "standard", "premium"] as const).map((tierName) => (
            <Select
              key={tierName}
              //   value={tiers[tierName].deliveryDays ? String(tiers[tierName].deliveryDays) : undefined} This show never add been here
              onValueChange={(v) =>
                updateTier(tierName, "revisionCount", Number(v))
              }
            >
              <SelectTrigger className="w-full min-w-0 text-xs rounded-none cursor-pointer">
                <SelectValue
                  className="truncate min-w-0"
                  placeholder="SELECT"
                />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] rounded-none">
                {REVISION_OPTIONS.map((d) => (
                  <SelectItem
                    className="text-xs rounded-none cursor-pointer data-[highlighted]:bg-muted"
                    key={d}
                    value={String(d)}
                  >
                    {d} {d === 1 ? "Revision" : "Revisions"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
