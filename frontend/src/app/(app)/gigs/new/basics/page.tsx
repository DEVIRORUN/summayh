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

  // Get teh actual category from selected id
  const selectedCategoryData = categories.find(c => c.id === selectedCategoryId)

  const isTutoringCategory = selectedCategoryData?.slug === "tutoring-lessons";

  const handleSubmit = async () => {
    setError(null);


    if(!title.trim()) return setError("Title is required.");
    if(!selectedSubCategoryId) return setError("Please select a category and subcategory.");

    setIsSubmitting(true);
    try {
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
    <div className="flex flex-col">
      <div className="p-5 min-w-0">
        <GigStepper />
      </div>
      <div className="text-muted-foreground bg-card border border-border rounded-md flex flex-col gap-2 m-5 shadow shadow-muted min-w-0">
        <div className="title flex flex-row p-4 gap-4 min-w-0 max-w-full">
          <div className="flex flex-col w-[220px] md:w-[280px] min-w-0">
            <span className="font-semibold">Gig title</span>
            <div className="text-xs ">
              Your Gig title is prime real estate.{" "}
              <span className="font-semibold">
                Pack it with exact sreach terms your buyers are looking for.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="rounded-xs text-xs h-24 min-h-24 max-h-24 resize-none flex-1"
              placeholder="Add a punchy title..."
            />
            <span className="text-xs text-muted-foreground self-end">
              {title.length} / 80
            </span>
          </div>
        </div>
        <div className="category flex flex-row p-2 gap-2 px-5 min-w-0">
          <div className="flex flex-col w-[220px] md:w-[280px] align-top shrink-0">
            <span className="font-semibold">Category</span>
            <div className="text-xs ">
              Choose the category and sub-category most aligned with your Gig.
            </div>
          </div>
          <div className="cat flex flex-row gap-4 min-w-0 flex-1">
            <Select
              value={selectedCategoryId}
              onValueChange={(val) => {
                setSelectedCategoryId(val);
                SetSelectedSubCategoryId(""); // Reset sub when main changes
              }}
            >
              <SelectTrigger className="cursor-pointer rounded-xs text-xs min-w-0 flex-1">
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
              <SelectTrigger className="cursor-pointer rounded-xs text-xs min-w-0 flex-1">
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
          <div className="delivery-mode flex flex-row p-2 gap-2 px-5 min-w-0">
            <div className="flex flex-col w-[220px] md:w-[280px] shrink-0">
              <span className="font-semibold">Delivery Mode</span>
              <div className="text-xs">
                How will you deliver this tutoring gig?
              </div>
            </div>
            <RadioGroup
              value={deliveryMode}
              onValueChange={(val: "DIGITAL" | "LIVE") => SetDeliveryMode(val)}
              className="flex flex-row gap-4 flex-1 min-w-0"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="DIGITAL" id="digital" className="cursor-pointer text-muted-foreground data-checked:bg-muted-foreground data-[state=checked]:border-muted-foreground"/> {/*Tried to change teh blue default color*/}
                <label htmlFor="digital" className="text-xs">Recorded / Async Delivery</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="LIVE" id="live" className="cursor-pointer"/>
                <label htmlFor="live" className="text-xs">Live Video Session</label>
              </div>
            </RadioGroup>
          </div>
        )}
        <div className="tags flex flex-row p-2 gap-2 px-5 min-w-0">
          <div className="flex flex-col w-[220px] md:w-[280px] shrink-0">
            <span className="font-semibold">Search tags</span>
            <div className="text-xs ">
              Max out all 5 tags with high-traffic keywords so buyers can actually
              find you.
            </div>
          </div>
          <div className="flex-1 gap-1 px-2">
            <span className="font-semibold">Positive Words</span>
            <p className="text-xs text-muted-foreground mb-1.5">Think like your buyers. Search what they type</p>
            <div 
              onClick={() => document.getElementById("tag-input")?.focus()}
              className="items-center flex flex-wrap border rounded-xs min-w-0 min-h-10 p-2 font-semibold">
                {tags.map((tag, i) => (
                <Badge key={i} className="my-1 text-muted-foreground flex items-center gap-1 bg-muted mx-1 rounded-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents focusing the input when clicking the delete 'X'
                      setTags(tags.filter((_, idx) => idx !== i))
                    }}
                    className="hover:cursor-pointer"
                  >
                    <X className="h-3 w-3" strokeWidth={4} />
                  </button>
                </Badge>
              ))}
              <input 
                id="tag-input"
                className="flex-1 min-w-[80px] h-8 outline-none text-xs bg-transparent border-none"
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
            <p className="text-xs text-muted-foreground/70">5 tags maximum. Use letters and numbers only.</p>
          </div>
        </div>
        {error && <p className="text-xs text-destructive px-5 font-semibold">{error}</p>}
        <div className="flex justify-end p-5">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xs bg-muted-foreground hover:bg-foreground cursor-pointer">
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
