"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export const STEPS = [
  { key: "basics", label: "Overview", helpText: "What's your Gig about...?" },
  {
    key: "description",
    label: "Desctiption & FAQ",
    helpText: "Explain what you offer...",
  },
  { key: "pricing", label: "Pricing", helpText: "Set your 3 tiers..." },
  {
    key: "requirements",
    label: "Requirements",
    helpText: "Ask buyers what you need...",
  },
  { key: "gallery", label: "Gallery", helpText: "Upload your best work..." },
  {
    key: "publish",
    label: "Review & Publish",
    helpText: "Final check before going live...",
  },
];
interface GigStepperProps {
  gigId?: string;
}

export default function GigStepper({ gigId }: GigStepperProps) {
  const pathname = usePathname();
  const currentKey = pathname.split("/").pop();
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);

  return (
    <div className="flex flex-wrap items-center bg-muted p-4 rounded-xs w-full gap-y-3 gap-x-2 min-w-0 max-w-full">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isPassed = i < currentIndex;
        const isClickable = isPassed

        const circle = (
          <div className={cn("rounded-full w-5 h-5  text-background flex items-center justify-center text-xs font-semibold shrink-0",
                isActive ? "bg-blue-600" : "bg-blue-400"
            )}>
              {i + 1}
            </div>
        )

        return (
          <div key={step.key} className="flex items-center gap-2 min-w-0">
            {isClickable ? (
              <Link href={`/gigs/new/${gigId}/${step.key}`} className="flex items-center gap-2">
                  <div className="bg-blue-600 rounded-full w-5 h-5  text-background flex items-center justify-center text-xs font-semibold shrink-0">
                      {i + 1}
                    </div>
                <span
                  className="text-xs whitespace-nowrap text-primary font-bold"
                >
                  {step.label}
                </span>
              </Link>
            ) : (
              <>
                {circle}
                <span
                    className={cn(
                      "text-xs whitespace-nowrap",
                      isActive ? "font-bold" : "font-normal"
                    )}
                  >
                    {step.label}
                  </span>
              </>
            )}
            {i < STEPS.length - 1 && (
              <ChevronRight strokeWidth={1.5} className="h-4 w-4 text-muted-background shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
