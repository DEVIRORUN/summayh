import { Button } from "@/components/ui/button";
import { PricingActionButtons } from "@/components/pricing/PricingActionButton";
import { Check } from "lucide-react";

const FEATURE_GROUPS = [
  {
    title: "Discovery & Matching",
    features: [
      { name: "Smart brief-to-gig embedding matching", active: true },
      { name: "Early access to new category launches", active: false },
      { name: "Priority placement in search ties", active: false },
    ],
  },
  {
    title: "Content & Profile Tooling",
    features: [
      { name: "AI gig description & bio drafts", active: true },
      { name: "Tags cross-checks & performance suggestions", active: true },
      { name: "Portfolio & case-study generator", active: false },
      { name: "Auto-translate gig listings", active: false },
    ],
  },
  {
    title: "Business Operations",
    features: [
      { name: "Lower platform commission %", active: true },
      { name: "Advanced analytics & micro-level tag stats", active: false },
      { name: "Bulk actions (duplicate, tier pricing edits)", active: false },
      { name: "Priority support & dispute resolution", active: false },
    ],
  },
  {
    title: "Trust & Status Signals",
    features: [
      { name: "Exclusive Founders Badge (Founders pass only)", active: true },
      { name: "Higher file upload limits & retention", active: false },
      { name: "Custom profile URL slug", active: false },
    ],
  },
];

export default async function PricingPage() {
  const [foundersRes, proPlansRes] = await Promise.all([
    fetch(`${process.env.NODE_API_URL}/api/founders-pass/availability`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NODE_API_URL}/api/pro-subscriptions/plans`, {
      cache: "no-store",
    }),
  ]);

  if (!foundersRes.ok || !proPlansRes.ok) {
    console.error("[PRICING PAGE] Failed to fetch", {
      foundersStatus: foundersRes.status,
      proPlansStatus: proPlansRes.status,
    });
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
        Unable to load pricing right now. Please try again later.
      </div>
    );
  }

  const foundersData = await foundersRes.json();
  const founders = foundersData.data;
  const proPlan = await proPlansRes.json();

  return (
    <main className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Go Pro on SUMMAYH
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Unlock advanced discovery tools, lower commissions, and AI tooling designed to scale your freelance business.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="flex flex-col gap-6">
        
        {/* Founders Pass Card */}
        {!founders.soldOut && (
          <div className="relative overflow-hidden bg-card border-2 border-primary rounded-xs p-6 shadow-sm">
            {/* Double Slanted Gradient Reflection (Tied to CSS Variables) */}
            <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,hsl(var(--primary)/0.12)_25%,hsl(var(--primary)/0.04)_30%,transparent_35%,transparent_50%,hsl(var(--primary)/0.08)_55%,hsl(var(--primary)/0.02)_60%,transparent_65%)] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
                  Limited Availability - {founders.remaining} left
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  Lifetime Founders Pass
                </h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    ₦{founders.priceNaira.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    / one-time payment
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 max-w-md">
                  Secure lifetime access to all current and future Pro features, plus an exclusive profile badge. Never pay a subscription fee.
                </p>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                <PricingActionButtons type="founders" />
              </div>
            </div>
          </div>
        )}

        {/* Pro Subscriptions Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-foreground">Standard Subscriptions</h3>
          {proPlan.data.length === 0 ? (
            <div className="border border-border border-dashed rounded-xs p-8 text-center bg-card/50">
              <p className="text-xs text-muted-foreground">
                Subscription plans coming soon.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {proPlan.data.map((plan: any) => (
                <div
                  key={plan.id}
                  className="flex flex-col bg-card border border-border rounded-xs p-6 hover:border-primary/50 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-6">
                    <span className="text-2xl font-bold text-foreground">
                      ₦{plan.priceNaira.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      /{plan.interval === "MONTHLY" ? "mo" : "yr"}
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border/40">
                    <PricingActionButtons type="subscription" planId={plan.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* Feature Breakdown */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-foreground">{"What's included in Pro?"}</h3>
          <p className="text-xs text-muted-foreground">
            Everything you need to optimize your workflow and rank higher.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10 mt-2">
          {FEATURE_GROUPS.map((group, i) => (
            <div key={i} className="flex flex-col gap-4 min-w-0">
              <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider text-[11px]">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {group.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-xs">
                    {f.active ? (
                      <>
                        <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={3} />
                        <span className="text-foreground font-medium leading-relaxed">
                          {f.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 shrink-0" /> {/* Alignment Spacer */}
                        <div className="flex items-center flex-wrap gap-2 leading-relaxed">
                          <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                            {f.name}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider border border-border bg-background px-1.5 py-0.5 rounded-sm">
                            Soon
                          </span>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}