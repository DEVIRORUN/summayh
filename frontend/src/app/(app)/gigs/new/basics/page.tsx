"use client";

import { Input } from "@/components/ui/input";
import GigStepper from "@/components/axiom/GigStepper";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[]
}

export default function BasicsGigPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");

  const [categories, setCategories] = useState<CategoryNode[]>([])
  
  // TRACK CATEGORY-LOGIC - now storing IDs, not just display strings
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, SetSelectedSubCategoryId] = useState<string>("");
  const [deliveryMode, SetDeliveryMode] = useState<"DIGITAL" | "LIVE">("DIGITAL");
  const [showAvailabilityPrompt, setShowAvailabilityPrompt] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category/tree");
        const { data } = await res.json();
        setCategories(data);
      } catch(error) {
        console.error("Failed to fetch categories: ", error)
      }
    };

    fetchCategories(); 
  }, []);

  if (!mounted) {
    return <div className="p-5 animate-pulse font-semibold">Loading...</div>
  }

  // Get the actual category from selected id
  const selectedCategoryData = categories.find(c => c.id === selectedCategoryId)

  const isTutoringCategory = selectedCategoryData?.slug === "tutoring-lessons";

  const handleSubmit = async () => {
    setError(null);

    if(!title.trim()) return setError("Title is required.");
    if(!selectedSubCategoryId) return setError("Please select a category and subcategory.");

    setIsSubmitting(true);
    try {
      if (isTutoringCategory && deliveryMode === "LIVE") {
        const availRes = await fetch("/api/seller/availability");
        if (availRes.ok) {
            const { data } = await availRes.json();
            const hasAvailability = Array.isArray(data) && data.length > 0;
            if (!hasAvailability) {
                setShowAvailabilityPrompt(true);
                setIsSubmitting(false);
                return;
            }
        }
      }
      const res = await fetch("/api/gig/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          categoryId: selectedSubCategoryId,
          tags,
          deliveryMode: isTutoringCategory ? deliveryMode : "DIGITAL",
        }),
      });

      if(!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create draft.")
      }

      const { data } = await res.json();
      router.push(`/gigs/new/${data.id}/description`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
      <div className="p-4 sm:p-5 min-w-0">
        <GigStepper />
      </div>
      <div className="text-muted-foreground bg-card border border-border rounded-xs flex flex-col gap-6 m-4 sm:m-5 p-4 sm:p-6 shadow-xs min-w-0">
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Gig title</span>
            <div className="text-xs text-muted-foreground mt-1">
              Your Gig title is prime real estate.{" "}
              <span className="font-medium text-foreground/80">
                Pack it with exact sreach terms your buyers are looking for.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="rounded-xs text-xs h-24 min-h-24 max-h-24 resize-none w-full"
              placeholder="Add a punchy title..."
            />
            <span className="text-xs text-muted-foreground self-end">
              {title.length} / 80
            </span>
          </div>
        </div>

        <hr className="border-border/60" />

        {/* CATEGORY SECTION */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Category</span>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the category and sub-category most aligned with your Gig.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 min-w-0 flex-1">
            <Select
              value={selectedCategoryId}
              onValueChange={(val) => {
                setSelectedCategoryId(val);
                SetSelectedSubCategoryId(""); // Reset sub when main changes
              }}
            >
              <SelectTrigger className="cursor-pointer rounded-xs text-xs w-full flex-1 min-w-0">
                <SelectValue placeholder="SELECT A CATEGORY" className="truncate" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={0}
                className="rounded-xs"
                style={{ width: "var(--radix-select-trigger-width)" }}
              >
                {categories.map((cat, i) => (
                  <SelectItem value={cat.id} key={i} className="rounded-xs text-xs">
                    {cat.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedSubCategoryId}
              onValueChange={SetSelectedSubCategoryId}
              disabled={Boolean(!selectedCategoryId)}
            >
              <SelectTrigger className="cursor-pointer rounded-xs text-xs flex-1 min-w-0">
                <SelectValue
                  placeholder={
                    selectedCategoryId
                      ? "SELECT A SUBCATEGORY"
                      : "CHOOSE A CATEGORY FIRST"
                  }
                />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={0}
                className="rounded-xs"
                style={{ width: "var(--radix-select-trigger-width)" }}
              >
                {selectedCategoryData?.children.map((sub, i) => (
                    <SelectItem
                      value={sub.id}
                      key={i}
                      className="rounded-xs text-xs"
                    >
                      {sub.name.toUpperCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isTutoringCategory && (
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
            <div className="flex flex-col w-full md:w-[280px] shrink-0">
              <span className="font-semibold text-foreground text-sm">Delivery Mode</span>
              <div className="text-xs text-muted-foreground mt-1">
                How will you deliver this tutoring gig?
              </div>
            </div>
            <RadioGroup
              value={deliveryMode}
              onValueChange={(val: "DIGITAL" | "LIVE") => SetDeliveryMode(val)}
              className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0 pt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="DIGITAL" id="digital" className="cursor-pointer text-muted-foreground data-checked:bg-muted-foreground data-[state=checked]:border-muted-foreground"/> {/*Tried to change the blue default color*/}
                <label htmlFor="digital" className="text-xs text-foreground cursor-pointer">Recorded / Async Delivery</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="LIVE" id="live" className="cursor-pointer"/>
                <label htmlFor="live" className="text-xs text-foreground cursor-pointer">Live Video Session</label>
              </div>
            </RadioGroup>
          </div>
        )}

        <hr className="border-border/60"/>

        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Search tags</span>
            <div className="text-xs text-muted-foreground mt-1">
              Max out all 5 tags with high-traffic keywords so buyers can actually find you.
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-xs text-foreground block mb-1">Positive Words</span>
            <p className="text-xs text-muted-foreground mb-2">Think like your buyers. Search what they type</p>
            <div 
              onClick={() => document.getElementById("tag-input")?.focus()}
              className="items-center flex flex-wrap gap-1.5 border border-input rounded-xs min-w-0 min-h-10 p-2 text-xs focus-within:ring-1 focus-within:ring-ring cursor-text bg-background">
                {tags.map((tag, i) => (
                <Badge key={i} className="text-foreground flex items-center gap-1 bg-muted hover:bg-muted/80 rounded-xs px-2 py-0.5 text-xs font-normal">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents focusing the input when clicking the delete 'X'
                      setTags(tags.filter((_, idx) => idx !== i))
                    }}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" strokeWidth={4} />
                  </button>
                </Badge>
              ))}
              <input 
                id="tag-input"
                className="flex-1 min-w-[100px] h-6 outline-none text-xs bg-transparent text-foreground placeholder:text-muted-foreground"
                placeholder={tags.length === 0 ? "Type tag & press Enter or comma..." : ""}
                value={inputValue}
                disabled={tags.length >= 5}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "," || e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = inputValue.trim();
                    if (trimmed && tags.length < 5 && !tags.includes(trimmed)) {
                      setTags([...tags, trimmed]);
                    }
                    setInputValue("");
                  }
                  if(e.key === "Backspace" && inputValue === "" && tags.length > 0) {
                    setTags(tags.slice(0, -1));
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-1.6">5 tags maximum. Use letters and numbers only.</p>
          </div>
        </div>
        {showAvailabilityPrompt && (
          <div className="border border-amber-300 bg-amber-50 text-amber-900 rounded-xs p-4 flex flex-col gap-2 text-xs">
            <p className="font-medium">Set your availability first</p>
            <p className="text-amber-800">
                Live tutoring gigs need your availability configured so buyers can book real time slots.
            </p>
            <div className="flex gap-2 mt-1">
                <Button
                    size="sm"
                    className="rounded-xs text-xs cursor-pointer"
                    onClick={() => router.push("/settings?tab=availability")}
                >
                    Go to Settings
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xs text-xs cursor-pointer"
                    onClick={() => setShowAvailabilityPrompt(false)}
                >
                    Dismiss
                </Button>
            </div>
        </div>
        )}
        {error && <p className="text-xs text-destructive px-5 font-medium pt-2">{error}</p>}
        <div className="flex justify-end pr-4 border-t border-border/40">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xs mt-2.5 font-medium text-xs px-5 cursor-pointer">
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
