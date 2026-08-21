"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDraftGig } from "@/contexts/draftGigContext";
import { STEP_ROUTES } from "@/lib/gigSteps";
import { cn } from "@/lib/utils";

export default function DescriptionPage() {
    const router = useRouter();
    const { gigId } = useParams();
    const { draft, refetchDraft } = useDraftGig();

  const [description, setDescription] = useState(draft?.description ?? "");
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    draft?.gigFAQs?.map(f => ({ question: f.question, answer: f.answer })) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFaq() {
    setFaqs([...faqs, { question: "", answer: "" }]);
  }

  const handleSubmit = async () => {
    setError(null);

    if(!description.trim()) return setError('Description is required');

    setIsSubmitting(true);
    try {
        const res = await fetch(`/api/gig/${gigId}/description`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, faqs })
        });

        if(!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to save description.");
        }

        await refetchDraft();
        router.push(`/gigs/new/${gigId}/${STEP_ROUTES.DRAFT_DESCRIPTION}`);
    } catch(err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-card text-muted-foreground flex gap-4 flex-col min-w-0">
      <span className="text-2xl font-semibold">Description</span>
      <span className="border-b-1 border-border" />
      <div className="contain border rounded-xs border-border">
        <div className="flex flex-row justify-start gap-1 items-center py-0.5 px-2">
          {/* <span
                        // onClick={} {/** Don't know how to make the next text tyoed after sekecting this or when highlighting a oarticular Text and sleect this 
                        className="font-bold text-xs cursor-pointer hover:text-background hover:bg-muted-foreground px-1 rounded-xs"
                    >B</span> */}
          <span className="text-xs text-muted-foreground/40">Coming soon</span>

          {/* Then for highlight, ordered and unodrer list */}
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="canvas rounded-none border-0 border-t-1 min-h-30 "
          placeholder="Describe what you offer, who it's for, and what makes you different..."
        />
      </div>

      {/* FAQ builder still to be added here */}

        {/* <div className="flex flex-col gap-2"> */}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                        "bg-foreground rounded-md cursor-pointer bg-muted-foreground hover:bg-foreground",
                        isSubmitting ? "animate-pulse" : ""
                )}>
                    {isSubmitting ? "Saving..." : "Save & Continue"}
                </Button>
            </div>
        {/* </div> */}
    </div>
  );
}
