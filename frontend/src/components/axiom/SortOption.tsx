import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest";

interface SortDropdownProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  relevance: "Best Match",
  "price-low": "Price: Low to High",
  "price-high": "Price: High to Low",
  rating: "Highest Rated",
  newest: "Newest",
};

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
      <SelectContent>
        {Object.entries(sortLabels).map(([key, label]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}