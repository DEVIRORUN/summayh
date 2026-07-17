import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResultsGridProps {
  children: ReactNode;
  layout?: "grid" | "list";
}

export function ResultsGrid({ children, layout = "grid" }: ResultsGridProps) {
  return (
    <div className={cn(
      layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"
    )}>
      {children}
    </div>
  );
}