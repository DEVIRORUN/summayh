import { Button } from "@/components/ui/button";
import { PriceTag } from "../axiom/PriceTag";

interface StickyOrderCTAProps {
  selectedTier: { label: string; price: number };
  onOrderNow: () => void;
}

export function StickyOrderCTA({ selectedTier, onOrderNow }: StickyOrderCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 flex items-center justify-between z-20">
      <div>
        <span className="text-xs text-muted-foreground">{selectedTier.label}</span>
        <PriceTag price={selectedTier.price} size="lg" />
      </div>
      <Button onClick={onOrderNow}>Continue (₦{selectedTier.price.toLocaleString()})</Button>
    </div>
  );
}