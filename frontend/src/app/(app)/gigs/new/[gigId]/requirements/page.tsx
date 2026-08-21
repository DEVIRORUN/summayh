"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { useDraftGig } from "@/contexts/draftGigContext";

interface RequirementInput {
  question: string;
  inputType: "FREE_TEXT" | "MULTIPLE_CHOICE" | "FILE_UPLOAD" | "YES_NO";
  options: string[];
  isRequired: boolean;
}

export default function RequirementsGigPage() {
  const { draft, refetchDraft } = useDraftGig();
  const router = useRouter();
  const { gigId } = useParams();
  const [requirements, setRequirements] = useState<RequirementInput[]>(
    draft?.requirementTemplates?.map(rt => ({
      question: rt.question,
      inputType: rt.inputType as RequirementInput["inputType"],
      options: rt.options,
      isRequired: rt.isRequired,
    })) ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionDrafts, setOptionDrafts] = useState<Record<number, string>>({});

  const addRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      { question: "", inputType: "FREE_TEXT", options: [], isRequired: true },
    ]);
  };

  const updateRequirement = (
    index: number,
    field: keyof RequirementInput,
    value: unknown, // <- better than any popping red squidly lines
  ) => {
    setRequirements((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: value };
        if (field === "inputType" && value !== "MULTIPLE_CHOICE") {
          updated.options = [];
        }
        return updated;
      }),
    );
  };

  const addOption = (index: number) => {
    const val = (optionDrafts[index] ?? "").trim();
    if (!val) return;
    const current = requirements[index].options;
    if (current.includes(val)) return;
    updateRequirement(index, "options", [...current, val]);
    setOptionDrafts((prev) => ({ ...prev, [index]: "" }));
  }

  const removeRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    const invalidMC = requirements.find(
      (r) => r.inputType === "MULTIPLE_CHOICE" && r.options.length < 2
    );
    if (invalidMC) {
      setError("Multiple choice questions need at least 2 options.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gig/${gigId}/requirements`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementTemplates: requirements }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Failed to save requirements.");
      }

      await refetchDraft();
      router.push(`/gigs/new/${gigId}/gallery`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="text-muted-foreground min-w-0">
      <span className="font-semibold text-2xl">Requirements</span>
      <hr className="border-border my-4" />

      {requirements.map((req, i) => (
        <div
          key={i}
          className="border border-border rounded-xs p-3 mb-2 flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold">Question {i + 1}</span>
            <button onClick={() => removeRequirement(i)}>
              <X className="cursor-pointer h-3 w-3" />
            </button>
          </div>
          <Input
            value={req.question}
            onChange={(e) => updateRequirement(i, "question", e.target.value)}
            placeholder="e.g. What's your brand name?"
            className="text-xs rounded-xs"
          />
          <Select
            value={req.inputType}
            onValueChange={(v) => updateRequirement(i, "inputType", v)}
          >
            <SelectTrigger className="text-xs rounded-xs cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xs">
              <SelectItem className="rounded-xs cursor-pointer data-[highlighted]:bg-muted" value="FREE_TEXT">Free Text</SelectItem>
              <SelectItem className="rounded-xs cursor-pointer data-[highlighted]:bg-muted" value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem className="rounded-xs cursor-pointer data-[highlighted]:bg-muted" value="FILE_UPLOAD">File Upload</SelectItem>
              <SelectItem className="rounded-xs cursor-pointer data-[highlighted]:bg-muted" value="YES_NO">Yes/No</SelectItem>
            </SelectContent>
          </Select>
          {req.inputType === "MULTIPLE_CHOICE" && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Options</span>
              {req.options.map((opt, optIdx) => (
                <span key={optIdx} className="flex items-center justify-between cursor-pointer gap-1 bg-muted text-xs px-2 py-1 rounded-xs">
                  {opt}
                  <Button
                    type="button"
                    className="bg-unset hover:bg-muted-foreground/60 transition-colors duration-100 cursor-pointer"
                    onClick={() => 
                      updateRequirement(
                        i,
                        "options",
                        req.options.filter((_, oi) => oi !== optIdx)
                      )
                    }
                  >
                    <X strokeWidth="3" className="h-3 w-3 text-foreground"/>
                  </Button>
                </span>
              ))}
              <div className="flex gap-1">
                <Input
                  type="text"
                  onChange={(e) => 
                    setOptionDrafts((prev) => ({ ...prev, [i]: e.target.value }))
                  }
                  placeholder="Type an option, press Enter"
                  className="flex-1 min-w-[100px] text-xs outline-none bg-transparent rounded-xs py-1.5"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption(i);
                    }
                  }}
                />
                <Button type="button" className="text-xs cursor-pointer rounded-xs" onClick={() => addOption(i)}>Add</Button>
              </div>
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={addRequirement}
        variant="outline"
        className="rounded-xs text-xs cursor-pointer"
      >
        + Add Question
      </Button>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-muted-foreground hover:bg-foreground rounded-xs cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Next & Submit"}
        </Button>
      </div>
    </main>
  );
}
