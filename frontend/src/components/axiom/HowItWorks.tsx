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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {steps.map((s, i) => (
        <div 
          key={i} 
          className="group relative flex flex-col items-start text-left bg-card text-card-foreground border bodrer-border rounded-lg p-5 sm:p-6 transition-all duration-200 hover:border-ring/50 hover:bg-accent/50 w-full min-w-0">
            {/* Top Row */}
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-xs font-mono font-medium text-muted-foreground bg-muted border border-border rounded-md px-2 py-0.5">
                {i + 1}
              </span>
              <div className="p-2 rounded-md bg-secondary text-foreground group-hover:text-primary transition-colors">
                {s.icon}
              </div>
            </div>

            {/* Content */}
          <h3 className="font-heading font-medium text-base text-foreground tracking-tight mb-1.5">
            {s.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed"> {/* // leading-relaxed maxkes taske a lilbit longer vertically */}
            {s.description}
            </p>
        </div>
      ))}
    </div>
  );
}