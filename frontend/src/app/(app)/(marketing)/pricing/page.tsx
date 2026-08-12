import { Button } from "@/components/ui/button";
import { PricingActionButtons } from "@/components/pricing/PricingActionButton";
export default async function PricingPage() {
    const [foundersRes, proPlansRes] = await Promise.all([
        fetch(`${process.env.NODE_API_URL}/api/founders-pass/availability`, { cache: "no-store" }),
        fetch(`${process.env.NODE_API_URL}/api/pro-subscriptions/plans`, { cache: "no-store" }),
    ]);

    if (!foundersRes.ok || !proPlansRes.ok) {
        console.error("[PRICING PAGE] Failed to fetch", { foundersStatus: foundersRes.status, proPlansStatus: proPlansRes.status })
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Unable to load pricing right now.</div>
    }

    const foundersData = await foundersRes.json();
    const founders = foundersData.data
    const proPlan = await proPlansRes.json();

    return (
        <main className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold mb-8">Go Pro on SUMMAYH</h1>

            {!foundersData.soldOut && (
                <div className="border-2 border-primary rounded-sm p-6 mb-6">
                    <span className="text-xs font-semibold text-primary">LIMITED - {founders.remaining} left</span>
                    <h2 className="text-lg font-bold mt-1">Founders Pass - ₦{founders.priceNaira.toLocaleString()}</h2>
                    <p className="text-xs pb-0.5 text-muted-foreground mt-1">One-time payment</p>
                     <PricingActionButtons type="founders" />
                </div>
            )}

            {proPlan.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Subscription plans coming soon.</p>
            ): (
                <div className="grid md:grid-cols-2 gap-4">
                    {proPlan.data.map((plan: any) => (
                        <div key={plan.id} className="border border-border rounded-sm p-6 hover:ring-1 hover:ring-ring transition-colors duration-300">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-2xl font-bold mt-1">₦{plan.priceNaira.toLocaleString()}<span className="text-sm font-normal">/{plan.interval === "MONTHLY" ? "mo" : "yr"}</span></p>
                            <PricingActionButtons type="subscription" planId={plan.id} />
                        </div>
                    ))}
                </div>
            )}

        </main>
    )
}
