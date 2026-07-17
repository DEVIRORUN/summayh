// MockGigAccordionContainer.tsx
"use client";

import { GigDescriptionAccordion } from "../axiom/GigDescriptionAccordion"; 

export default function MockGigAccordionContainer() {
  const sampleDescription = 
    "I will deliver high-quality, modern, custom corporate branding materials.\n\n" +
    "Every design is crafted from scratch to perfectly reflect your tech startup's visual goals. " +
    "Please check out my specialized breakdowns below for revisions and guidelines.";

  const sampleSections = [
    { 
      title: "1. What software applications do you use?", 
      content: "I design vector assets exclusively inside Adobe Illustrator and export native master layout documents (.AI, .EPS, .SVG, and print-ready high-res PDFs)." 
    },
    { 
      title: "2. Can I request revisions after delivery?", 
      content: "Yes, every standard package tier automatically includes up to 3 rounds of structural revisions. Additional iterations can be ordered via the checkout upgrades panel." 
    },
    { 
      title: "3. Do you provide full commercial rights?", 
      content: "Absolutely. Once the order milestone status changes to fully completed, all global copyright ownership titles transfer over to you automatically." 
    }
  ];

  return (
    <div className="w-full max-w-xl p-6 bg-card rounded-xl border shadow-sm">
      <h2 className="text-base font-bold tracking-tight mb-4">Service Details</h2>
      <GigDescriptionAccordion 
        description={sampleDescription} 
        sections={sampleSections} 
      />
    </div>
  );
}
