import { ReactNode } from "react";

interface Step {
  icon: ReactNode;
  title: string;
  description: string;
}

interface HowItWorksStepsProps {
  steps: Step[];
}

export function HowItWorksSteps({ steps }: HowItWorksStepsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((s, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {i + 1}
          </div>
          <div className="text-primary">{s.icon}</div>
          <h3 className="font-semibold">{s.title}</h3>
          <p className="text-sm text-muted-foreground">{s.description}</p>
        </div>
      ))}
    </div>
  );
}