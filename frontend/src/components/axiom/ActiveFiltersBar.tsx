import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ActiveFilter {
  id: string;
  label: string;
}

interface ActiveFiltersBarProps {
  filters: ActiveFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function ActiveFiltersBar({ filters, onRemove, onClearAll }: ActiveFiltersBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <Badge key={f.id} variant="secondary" className="gap-1 pr-1">
          {f.label}
          <button onClick={() => onRemove(f.id)}><X className="w-3 h-3" /></button>
        </Badge>
      ))}
      <button onClick={onClearAll} className="text-xs text-muted-foreground underline">Clear all</button>
    </div>
  );
}