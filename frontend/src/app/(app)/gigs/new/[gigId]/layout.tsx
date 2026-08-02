"use client";

import { usePathname, useParams } from "next/navigation";
import React from "react";
import Link from "next/link";
import GigStepper, { STEPS } from "@/components/axiom/GigStepper";


interface Helper {
    key: string;
    title: string;
    media: string;
    stepsToFollow: string;
    policy: string;
}

const HELPER_CONTENT: Record<string, Helper> = {
  description: {
    key: "description",
    title: "Write a compelling description",
    media: "/videos/description-tips.mp4",
    stepsToFollow:
      "Explain what you offer, who it's for, what result they should expect, and why your service is different. Keep it simple, specific, and buyer-focused.",
    policy:
      "Keep descriptions honest and clear — avoid exaggerated claims, misleading promises, or copied text.",
  },
  pricing: {
    key: "pricing",
    title: "Set clear pricing",
    media: "/videos/pricing-tips.mp4",
    stepsToFollow:
      "Create BASIC, STANDARD, and PREMIUM offers with visible differences in deliverables, speed, or support. Keep entry pricing attractive, and charge more for urgency, depth, or extras.",
    policy:
      "Make sure each tier has a real value difference. Do not hide important limits or add surprise costs after checkout.",
  },
  requirements: {
    key: "requirements",
    title: "Collect the right requirements",
    media: "/videos/requirements-tips.mp4",
    stepsToFollow:
      "Ask only for what you need to start the job: files, topic, deadline, goals, references, style preference, and any special instructions. For tutoring, include the subject, level, and what the student wants to understand.",
    policy:
      "Do not ask for unnecessary personal data. Keep requirements short, relevant, and easy to complete.",
  },
  gallery: {
    key: "gallery",
    title: "Build a strong gallery",
    media: "/videos/gallery-tips.mp4",
    stepsToFollow:
      "Upload samples, screenshots, before-and-after examples, short demo clips, or a clean cover image that shows your service quality. Use visuals that match the exact service buyers are ordering.",
    policy:
      "Use only your own work or work you have permission to show. Avoid fake samples, stolen images, watermarked content, or misleading previews.",
  },
  publish: {
    key: "publish",
    title: "Review and publish",
    media: "/videos/publish-tips.mp4",
    stepsToFollow:
      "Check your title, category, tags, pricing, requirements, and gallery before publishing. Make sure the service is specific, easy to understand, and ready to receive orders.",
    policy:
      "Publish only when the listing is complete and accurate. Keep the service aligned with what you can deliver on time.",
  },
};


export default function LayoutGigPage({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { gigId } = useParams();

    // To know which step we're on
    const currentStep = pathname.split("/").pop(); // The last var after "/"
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    const currentStepInfo = STEPS[currentIndex];
    
    const currentHelper = HELPER_CONTENT[currentStep ?? ""];

    // step check
    const prevStep = STEPS[currentIndex - 1];
    const backHref = prevStep ? `/gigs/new/${gigId}/${prevStep.key}` : `/gigs/new/basics`;

   return (
    <div className="flex flex-col min-h-screen min-w-0">
        <div className="p-5 min-w-0">
        <GigStepper />
        </div>

        <div className="body flex flex-row gap-4 px-5 min-w-0 flex-1">
        <main className="flex-1 min-w-0">{children}</main>

        <aside className="w-[260px] shrink-0 hidden lg:block">
            {currentHelper && (
            <div className="bg-muted rounded-xs p-4 sticky top-5">
                <h3 className="font-semibold text-sm mb-2">{currentHelper.title}</h3>
                <p className="text-xs text-muted-foreground">{currentHelper.stepsToFollow}</p>
            </div>
            )}
        </aside>
        </div>

        <div className="bottom flex justify-start p-5 border-t border-border mt-auto">
        <Link href={backHref} className="text-sm underline text-muted-foreground">
            ← Back
        </Link>
        </div>
    </div>
    );
}