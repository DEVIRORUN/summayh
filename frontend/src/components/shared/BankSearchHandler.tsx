import React, { useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { SETTLEMENT_BANK_CODES } from "@/data/banks";

const ALL_BANKS = Object.entries(SETTLEMENT_BANK_CODES).map(([name, code]) => ({
  name,
  code,
}));

interface BankInputProps {
  inputValue: string;             
  onInputChange: (value: string) => void;
  onBankSelect: (code: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

export function BankInput({
  inputValue,
  onInputChange,
  onBankSelect,
  error,
  onErrorChange,
}: BankInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isExactMatch = useMemo(() => {
    return ALL_BANKS.some((b) => b.name.toLowerCase() === inputValue.trim().toLowerCase());
  }, [inputValue]);

  const matches = useMemo(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase();
    return ALL_BANKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [inputValue]);

  const showDropdown = isFocused && inputValue.length > 0 && matches.length > 0;

  function handleSelect(bank: { name: string; code: string }) {
    onInputChange(bank.name);     // Update input box to full bank name
    onBankSelect(bank.code);      // Store the backend code
    onErrorChange?.(null);
    setIsFocused(false);
  }

return (
  <div className="flex flex-col gap-1 relative w-full">
    {/* 1. Parent wrapper container handles the premium border and focus states */}
    <div className="group flex flex-col rounded-xl border border-muted-foreground/20 bg-background/50 p-3 shadow-sm transition-all duration-200 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
      <label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-foreground">
        Bank
      </label>
      <Input
        type="text"
        placeholder="Type your bank name..."
        autoComplete="off"
        value={inputValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 180)}
        onChange={(e) => {
          onInputChange(e.target.value);
          if (error) onErrorChange?.(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (showDropdown && matches.length > 0) {
              handleSelect(matches[0]);
            } else if (!isExactMatch) {
              onErrorChange?.("Please select a valid bank from the suggestions list.");
            }
          }
        }}
        required
        /* 2. Strip out all inner visual styles so it blends into the parent card */
        className="h-auto border-0 p-0 pt-1 text-sm bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-medium"
      />
    </div>

    {/* Suggestion Dropdown */}
    {!isExactMatch && showDropdown && (
      <div
        className={cn(
          "absolute top-full left-0 right-0 mt-1 z-20 translate-y-1",
          "flex flex-col p-1 rounded-md border bg-background shadow-md",
          "max-h-[200px] overflow-y-auto scrollbar-none"
        )}
      >
        {matches.map((bank) => (
          <button
            type="button"
            key={bank.code}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(bank)}
            className={cn(
              "w-full shrink-0 text-left text-xs px-3 py-2 rounded-sm",
              "hover:bg-muted transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
            )}
          >
            {bank.name}
          </button>
        ))}
      </div>
    )}

    {error && <span className="w-full mt-1 text-xs text-red-500">{error}</span>}
  </div>
);
}