import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";


interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    onSubmit: () => void;
    suggestions?: string[];
    quickTags?: string[];
    placeholder?: string;
    variant?: "default" | "hero";
}

export function SearchBar({ value, onChange, onSubmit, suggestions = [], quickTags = [], placeholder = "Search gigs...", variant = "default" }: SearchBarProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
        <div className="relative w-full">
            {variant === "default" ? (<div className="flex gap-2">
                <div className="flex w-full items-center rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
                    <Input
                        value={value}
                        onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                        placeholder={placeholder}
                        className="border-0 shadow-none focus-visible:ring-0 h-10 rounded-r-none"
                    />
                    <Button onClick={onSubmit} className="text-background hover:bg-foreground/90 h-10 rounded-r-[5px] px-4 rounded-l-none bg-foreground"><Search className="w-4 h-4"/></Button>
                </div>
            </div>)
            : (
                <div className="w-full">
                    <div className="flex w-full items-center bg-background p-1.5 rounded-md border border-muted shadow-md">
                        <Input
                            value={value}
                            onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
                            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                            placeholder={placeholder}
                            className="border-0 shadow-none focus-visible:ring-0 h-10 rounded-r-none"
                        />
                        <Button 
                            onClick={onSubmit} 
                            className="text-background hover:bg-foreground/90 h-10 rounded-md px-3 bg-foreground"
                        >
                            <Search className="w-4 h-4"/>
                        </Button>
                    </div>

                    {!value.trim() && quickTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                            {quickTags.slice(0, 5).map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => { onChange(tag); onSubmit(); }}
                                    className="text-xs font-semibold text-white bg-foreground/30 hover:bg-white border border-white/80 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                                >
                                    {tag} <span className="opacity-60 text-[10px">→</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) }

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[105%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <button key={i} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border/40 last:border-0" onClick={() => { onChange(s); setShowSuggestions(false); }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}