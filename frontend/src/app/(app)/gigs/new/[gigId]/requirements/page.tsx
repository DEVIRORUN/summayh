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

interface RequirementInput {
  question: string;
  inputType: "FREE_TEXT" | "MULTIPLE_CHOICE" | "FILE_UPLOAD" | "YES_NO";
  options: string[];
  isRequired: boolean;
}

export default function RequirementsGigPage() {
  const router = useRouter();
  const { gigId } = useParams();
  const [requirements, setRequirements] = useState<RequirementInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const removeRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gig/${gigId}/requirements`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirementTemplates: requirements }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save requirements.");
      }

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
