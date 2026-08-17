"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  RequirementAnswer,
  RequirementTemplate,
} from "@/lib/order";

interface OrderRequirementsFormProps {
  orderId: string;
  templates: RequirementTemplate[];
}

type AnswerValue = string | string[];

export function OrderRequirementsForm({
  orderId,
  templates,
}: OrderRequirementsFormProps) {
  const router = useRouter();

  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => a.order - b.order),
    [templates],
  );

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));

    if (error) {
      setError(null);
    }
  }

  function toggleMultipleChoice(questionId: string, option: string) {
    const current = answers[questionId];

    const selected = Array.isArray(current)
      ? current
      : current
        ? [current]
        : [];

    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    setAnswer(questionId, next);
  }

  function validateAnswers(): RequirementAnswer[] | null {
    const missingQuestions: string[] = [];

    for (const template of sortedTemplates) {
      if (!template.isRequired) continue;

      const value = answers[template.id];

      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        missingQuestions.push(template.question);
      }
    }

    if (missingQuestions.length > 0) {
      setError(
        `Please answer the required question${missingQuestions.length > 1 ? "s" : ""}: ${missingQuestions.join(", ")}`,
      );
      return null;
    }

    const payload: RequirementAnswer[] = sortedTemplates
      .filter((template) => answers[template.id] !== undefined)
      .map((template) => ({
        questionId: template.id,
        answer: answers[template.id],
      }));

    return payload;
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setError(null);

    const payload = validateAnswers();

    if (!payload) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: payload,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to submit your requirements. Please try again.",
        );
      }

      router.refresh();
    } catch (err) {
      console.error("[OrderRequirementsForm] Submit failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your requirements. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Project Requirements
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Please provide the information the seller needs to start working on
          your order. Your delivery timer starts when you submit these
          requirements.
        </p>
      </div>

      {sortedTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          This gig does not require any additional information. Submit below
          to start the project.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedTemplates.map((template, index) => {
            const value = answers[template.id];

            return (
              <div
                key={template.id}
                className="flex flex-col gap-3"
              >
                <div>
                  <label className="text-sm font-medium">
                    {index + 1}. {template.question}
                    {template.isRequired && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </label>
                </div>

                {template.inputType === "FREE_TEXT" && (
                  <Textarea
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) =>
                      setAnswer(template.id, event.target.value)
                    }
                    placeholder="Type your answer..."
                    rows={5}
                    disabled={isSubmitting}
                  />
                )}

                {template.inputType === "YES_NO" && (
                  <div className="grid grid-cols-2 gap-3">
                    {(["YES", "NO"] as const).map((option) => {
                      const selected = value === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            setAnswer(template.id, option)
                          }
                          className={[
                            "rounded-lg border px-4 py-3 text-sm font-medium transition",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:bg-muted",
                            isSubmitting
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer",
                          ].join(" ")}
                        >
                          {option === "YES" ? "Yes" : "No"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {template.inputType === "MULTIPLE_CHOICE" && (
                  <div className="flex flex-col gap-2">
                    {template.options.map((option) => {
                      const selected =
                        Array.isArray(value) && value.includes(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            toggleMultipleChoice(
                              template.id,
                              option,
                            )
                          }
                          className={[
                            "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-background hover:bg-muted",
                            isSubmitting
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40",
                            ].join(" ")}
                          >
                            {selected && (
                              <span className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </span>

                          <span>{option}</span>
                        </button>
                      );
                    })}

                    {template.options.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No options were configured for this question.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Requirements"
          )}
        </Button>
      </div>
    </section>
  );
}