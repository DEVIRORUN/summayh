import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface Tier {
  label : string;
  customName?: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  sessionLengthMin?: number | null;
  breakLengthMin?: number | null;
  totalSessions?: number | null;
}

interface GigDescriptionAccordionProps {
  description: string;
  deliveryMode: "DIGITAL" | "LIVE" | "PHYSICAL";
  tiers?: Tier[];
}

export function GigDescriptionAccordion({ description, deliveryMode, tiers = [] }: GigDescriptionAccordionProps) {
  const isLive = deliveryMode === "LIVE";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm whitespace-pre-line">{description}</p>


      {tiers.length > 0 && (
        <Accordion type="single" collapsible>
          {tiers.map((tier, i) => (
            <AccordionItem key={i} value={`tier-${i}`}>
              <AccordionTrigger className="cursor-pointer">
                {tier.customName || tier.label} - ₦{tier.price.toLocaleString()}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm mb-2">{tier.description}</p>
                {isLive ? (
                  <ul className="text-xs text-muted-foreground flex flex-col gap-1">
                    <li>Session length: {tier.sessionLengthMin} min</li>
                    <li>Total sessions: {tier.totalSessions}</li>
                    <li>Break between sessions: {tier.breakLengthMin} min</li>
                  </ul>
                ) : (
                  <ul className="text-xs text-muted-foreground flex flex-col gap-1">
                    <li>Delivery: {tier.deliveryDays} {tier.deliveryDays === 1 ? "day" : "days"}</li>
                    <li>Revisions: {tier.revisionCount}</li>
                  </ul>
                )}
                </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}