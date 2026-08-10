"use client";

import { useRouter, usePathname } from "next/navigation";
import { EmptyState } from "@/components/axiom/EmptyState";
import { SearchX } from "lucide-react";

export function EmptyStateWrapper() {
  const router = useRouter();
  const pathname = usePathname();

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <EmptyState
      icon={<SearchX className="w-10 h-10" />}
      title="No gigs found"
      description="Try adjusting your filters or search terms."
      action={{ label: "Clear filters", onClick: resetFilters }}
    />
  );
}