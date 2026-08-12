import { Button } from "@/components/ui/button";

interface Pass {
    sold: number;
    remaining: number;
    maxPasses: number;
    priceNaira: number;
    soldOut: boolean;
}

export default async function FoundersPage() {
    const res = await fetch(`${process.env.NODE_API_URL}/api/founders-pass/availability`, { cache: "no-store" });
    if(!res.ok) {
        throw new Error(`Failed to fetch availability: ${res.statusText}`);
    }

    const data = await res.json();

    const { sold = 0, remaining = 0, maxPasses = 0, priceNaira = 0, soldOut = false }: Pass = data.data ?? data;
    return (
        <main className="max-w-3xl mx-auto py-16 px-4">
            <h1 className="text-3xl font-bold">Founders Pass</h1>
            <p className="text-muted-foreground mt-2">
                {soldOut
                    ? "Sold out — thank you to our first sellers."
                    : `${remaining} of ${maxPasses} passes left at ₦${priceNaira.toLocaleString()}`
                }
            </p>
            {!soldOut && (
                <Button>
                    Get Founders Badge
                </Button>
            )}
        </main>
    )
}

// Later good dsign with latest pll that just became a founder