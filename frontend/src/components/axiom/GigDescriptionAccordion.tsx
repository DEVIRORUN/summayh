import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface GigDescriptionAccordionProps {
  description: string;
  sections?: { title: string; content: string }[];
}

export function GigDescriptionAccordion({ description, sections = [] }: GigDescriptionAccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm whitespace-pre-line">{description}</p>
      {sections.length > 0 && (
        <Accordion type="single" collapsible>
          {sections.map((s, i) => (
            <AccordionItem key={i} value={`section-${i}`}>
              <AccordionTrigger>{s.title}</AccordionTrigger>
              <AccordionContent>{s.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}