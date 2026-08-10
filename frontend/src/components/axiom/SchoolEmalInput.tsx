// components/atoms/SchoolEmailInput.tsx
import React, { useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import schoolsData from "@/data/schools.json";

type School = { school: string; value: string };

const ALL_SCHOOLS: School[] = [...schoolsData.edu_ng, ...schoolsData.sch_ng];

const ALLOWED_SCHOOL_DOMAINS = new Set(
  ALL_SCHOOLS.map((s) => s.value.toLowerCase())
);

interface SchoolEmailInputProps {
  value: string;
  onChange: (value: string) => void;
  variant?: "dropdown"; // room for "inline" | "badge" later
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
  onSchoolSelected?: () => void;
}

export function SchoolEmailInput({
  value,
  onChange,
  error,
  onErrorChange,
  onSchoolSelected,
}: SchoolEmailInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const localPart = value.split("@")[0] ?? "";
  const domainQuery = value.includes("@") ? value.split("@")[1] ?? "" : "";
  const isExactMatch = ALLOWED_SCHOOL_DOMAINS.has(domainQuery.toLowerCase());

  const hasAt = value.includes("@")

  const matches = useMemo(() => {
    if (!domainQuery) return [];
    const q = domainQuery.toLowerCase();
    return ALL_SCHOOLS.filter(
      (s) =>
        s.school.toLowerCase().includes(q) ||
        s.value.toLowerCase().includes(q)
    );
  }, [domainQuery]);

  const showDropdown = isFocused && value.includes("@") && domainQuery.length > 0 && matches.length > 0;

  function handleSelect(school: School) {
    onChange(`${localPart}@${school.value}`);
    onErrorChange?.(null);

    onSchoolSelected?.();

    // E
  }

  return (
    <div className="flex flex-col gap-1 relative">
      <Label className="text-xs font-medium text-foreground">Email</Label>
      <Input
        type="email"
        autoComplete="new-password"
        placeholder="idan@student.lautech.edu.ng"
        className="text-sm"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)} // allow click before blur closes it
        onChange={(e) => {
            onChange(e.target.value);
            if (error) onErrorChange?.(null);
        }}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if(isExactMatch) {
                    onSchoolSelected?.();
                } else if(showDropdown && matches.length > 0) {
                    handleSelect(matches[0]); // Picks top suggestion by default
                }else {
                    onErrorChange?.(
                        "Please use a valid school email address (e.g. yourname@lautech.edu.ng)."
                    )
                }
            }
        }}
        required
      />
      {!hasAt && value.length > 0 && (
        <span className="text-xs text-red-500">{"Include an '@' in your email"}</span>
      )}

      {!isExactMatch && showDropdown && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-20",
            "flex flex-wrap gap-2 p-2 rounded-md border bg-background shadow-md",
            "max-h-[168px] overflow-y-auto" // ~5 rows before scroll
          )}
        >
          {matches.map((s) => (
            <button
              type="button"
              key={s.value}
              onMouseDown={(e) => e.preventDefault()} // fire before input's onBlur
              onClick={() => handleSelect(s)}
              className={cn(
                "text-xs px-2 py-1 rounded-full border",
                "hover:bg-muted transition-colors whitespace-nowrap"
              )}
            >
              {s.school}
            </button>
          ))}
        </div>
      )}

      {error && <span className="w-full text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function isSchoolDomainValid(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && ALLOWED_SCHOOL_DOMAINS.has(domain);
}