"use client";

import { CheckCircle2, FileText } from "lucide-react";

import type {
  RequirementAnswer,
  RequirementTemplate,
} from "@/lib/order";

interface OrderRequirementsSummaryProps {
  templates: RequirementTemplate[];
  answers: RequirementAnswer[];
  submittedAt?: string | null;
}

export function OrderRequirementsSummary({
  templates,
  answers,
  submittedAt,
}: OrderRequirementsSummaryProps) {
  const sortedTemplates = [...templates].sort(
    (a, b) => a.order - b.order,
  );

  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.answer]),
  );

  if (answers.length === 0) {
    return null;
  }

  function formatAnswer(answer: string | string[]) {
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }

    return answer;
  }

  return (
    <section className="w-full rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">
              Project Requirements
            </h2>
          </div>

          <p className="text-sm text-muted-foreground">
            The requirements submitted by the buyer for this order.
          </p>
        </div>

        {submittedAt && (
          <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <CheckCircle2 className="h-4 w-4 text-green-500" />

            Submitted{" "}
            {new Date(submittedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col divide-y divide-border">
        {sortedTemplates.map((template, index) => {
          const answer = answerMap.get(template.id);

          if (answer === undefined) {
            return null;
          }

          return (
            <div
              key={template.id}
              className="py-5 first:pt-0 last:pb-0"
            >
              <div className="mb-2 flex items-start gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}.
                </span>

                <h3 className="text-sm font-medium">
                  {template.question}
                </h3>
              </div>

              <div className="ml-5 rounded-lg bg-muted/50 px-4 py-3">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                  {formatAnswer(answer)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}