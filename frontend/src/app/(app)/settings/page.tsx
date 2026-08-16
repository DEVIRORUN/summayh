"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import SellerAvailabilityForm from "@/components/axiom/SellerAvailabilityForm";
import { AvatarUpload } from "@/components/settings/AvatarUpload";

interface ThemeOption {
    id: string;
    name: string;
    description: string;
    // Classes used for generating the visual mini-previews inside the cards
    previewBg: string;
    previewSidebar: string;
    previewPrimary: string;
    previewBorder: string;
}

const THEME_OPTIONS: ThemeOption[] =[
    {
    id: "cream",
    name: "Cozy Cream",
    description: "Your default editorial layout, featuring soft warm tones and sharp blue accents.",
    previewBg: "bg-[#F4F3EE]",
    previewSidebar: "bg-[#FAF9F5] border-r border-[#1F1F1E]/10",
    previewPrimary: "bg-[#5796DA]",
    previewBorder: "border-[#1F1F1E]/12",
  },
  {
    id: "slate",
    name: "Modern Slate",
    description: "A clean, bright, and highly professional layout using structured slate-grays.",
    previewBg: "bg-[#F8FAFC]",
    previewSidebar: "bg-white border-r border-[#E2E8F0]",
    previewPrimary: "bg-[#3B82F6]",
    previewBorder: "border-[#E2E8F0]",
  },
  {
    id: "dark",
    name: "Charcoal Dark",
    description: "A sleek, low-light workspace optimized for deep focus and midnight coding.",
    previewBg: "bg-[#1E1E1E]",
    previewSidebar: "bg-[#252526] border-r border-white/10",
    previewPrimary: "bg-[#ECECEC]",
    previewBorder: "border-white/10",
  },
]

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, SetMounted] = React.useState(false);

    // Avoid hydration mismatch by waiting for client-side mounting
    React.useEffect(() => {
        SetMounted(true)
    }, []);

    if (!mounted) {
        return (
            <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-muted animated-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Customize your workspace interface, theme states, and layout preferences.
                </p>
            </div>

            <hr className="border-border" />

            <div>
                <h2 className="text-lg font-medium mb-3">Profile Photo</h2>
                <AvatarUpload />
            </div>

            <hr className="border-border" />
            
            <SellerAvailabilityForm />

            <hr className="border-border" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-lg font-medium">Appearance & Theme</h2>
                    <p className="text-sm text-muted-foreground">
                        Switch between different curated color schemes for your dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {THEME_OPTIONS.map((opt) => {
                        const isActive = theme === opt.id;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => setTheme(opt.id)}
                                className={cn(
                                    "group relative flex flex-col text-left rounded-xl border p-4 transition-all duration-200 outline-hidden hover:border-forground/20",
                                    isActive
                                        ? "border-primary ring-2 ring-primary/20 bg-card"
                                        : "border-border bg-card/50"
                                )}
                            >
                                {/* Mini-Layout preview */}
                                <div className={cn("w-full h-24 rounded-lg overflow-hidden flex mb-4 border border-border/60 shadow-xs", opt.previewBg)}>
                                    {/* Mini-sidebar */}
                                    <div className={cn("w-1/4 h-full p-1.5 flex flex-col gap-1", opt.previewSidebar)}>
                                        <div className="w-4 h-1.5 rounded-xs bg-foreground/20" />
                                        <div className="w-8 h-1 rounded-xs bg-foreground/10" />
                                        <div className="w-6 h-1 rounded-xs bg-foreground/10" />
                                    </div>
                                    {/* Mini Main Content Area */}
                                    <div className="flex-1 p-2 flex flex-col justify-between">
                                        {/* Mini Navbar */}
                                        <div className="flex justify-between items-center pb-1 border-b border-border/50">
                                            <div className="w-8 h-1 rounded bg-foreground/15" />
                                            <div className="w-8 h-3 rounded-full bg-foreground/10" />
                                        </div>
                                        {/* Mini Body */}
                                        <div className="flex gap-1.5 items-end justify-between">
                                            <div className="space-y-1 flex-1">
                                                <div className="w-8 h-1 rounded bg-foreground/15" />
                                                <div className="w-8 h-3 rounded-full bg-foreground/10" />
                                            </div>
                                            <div className={cn("w-5 h-2.5 rounded-xs", opt.previewPrimary)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-foreground">{opt.name}</span>
                                    {isActive && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="h-3 w-3" strokeWidth={3} />
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {opt.description}
                                </p>
                            </button>
                        )
                    })
                    }
                </div>
            </div>

        </div>
    )
}