"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SellerAvailabilityForm from "@/components/axiom/SellerAvailabilityForm";
import Image from "next/image";

interface CategoryObject {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    createdAt?: string;
}

interface Tier {
    name: string; 
    price: number; 
    deliveryDays: number 
}

interface GigSummary {
    title: string;
    description: string;
    category: CategoryObject | string;
    subcategory: CategoryObject | string;
    tiers: Tier[];
    images?: string[];
    video?: string | null;
    gallery: string[];
    deliveryMode: "DIGITAL" | "LIVE"; // added
}

export default function PublishPage() {
    const router = useRouter();
    const { gigId } = useParams();
    const [gig, setGig] = useState<GigSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityCount, setAvailabilityCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!gigId) return;

        async function loadGig() {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/gig/${gigId}`);
                if (!res.ok) throw new Error("Failed to load gig");
                const data = await res.json();
                const gigData = data.data || data;
                setGig(gigData);

                // If it's a LIVE gig, check existing availability count
                if (gigData.deliveryMode === "LIVE") {
                    const availRes = await fetch(`/api/seller/availability`);
                    if (availRes.ok) {
                        const { data: slots } = await availRes.json();
                        setAvailabilityCount(Array.isArray(slots) ? slots.length : 0);
                    } else {
                        setAvailabilityCount(0);
                    }
                } else {
                    setAvailabilityCount(0); 
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong.")
            } finally {
                setIsLoading(false)
            }
        }
        loadGig();
    }, [gigId]);

    const isLive = gig?.deliveryMode === "LIVE";
    const needsAvailability = isLive && availabilityCount === 0;

    async function handleSubmit () {
        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/gig/${gigId}/publish`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to publish gig")
            }

            router.push(`/gigs/${gigId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) return <main className="p-6 animate-pulse">Loading...</main>
    if (!gig) return <main className="p-6 text-red-500">Could not load gig.</main>

    const galleryItems = gig.gallery || gig.images || [];

    return (
        <main className="flex flex-col gap-4">

            <div>
                <h1 className="text-xl font-semibold">Review your gig</h1>
                <p className="text-sm text-muted-foreground">
                    Check everything below before you publish. You can still edit later.
                </p>
            </div>
            
            {/* Title / Category */}
            <section className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-medium">{gig.title}</h2>
                        <p className="text-xs text-muted-foreground">
                            {typeof gig.category === "object" ? gig.category?.name : gig.category} / 
                            {typeof gig.subcategory === "object" ? gig.subcategory?.name : gig.subcategory}
                        </p>
                    </div>
                    <a href={`/gigs/${gigId}/edit/basics`} className="text-xs underline">
                        Edit
                    </a>
                </div>
            </section>

            {/* Description */}
            <section className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                    <h2 className="font-medium">{gig.description}</h2>
                    <a href={`/gigs/${gigId}/edit/description`} className="text-xs underline">
                        Edit
                    </a>
                </div>
            </section>

            {/* Pricing tiers */}
            <section className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-medium">Pricing</h2>
                    <a href={`/gigs/${gigId}/edit/pricing`} className="text-xs underline">
                        Edit
                    </a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {gig.tiers.map((tier) => (
                        <div key={tier.price} className="border rounded-sm p-2 text-center">
                            <p className="text-xs font-medium">{tier.name}</p>
                            <p className="text-sm">₦{tier.price.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">{tier.deliveryDays}d delivery</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Gallery */}
            <section className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-medium">Gallery</h2>
                            <a href={`/gigs/${gigId}/edit/gallery`} className="text-xs underline">
                                Edit
                            </a>
                        </div>
                        {galleryItems.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto">
                                {galleryItems.map((url, idx) => (
                                    <Image
                                        key={idx}
                                        src={url}
                                        width={80}
                                        height={80}
                                        alt={`Gig gallery image ${idx + 1}`}
                                        className="h-20 w-20 object-cover rounded-sm shrink-0 border"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No media available</p>
                        )}
            </section>

            {/* Availability gate for LIVE gigs */}
            {needsAvailability && (
                <section className="border border-amber-500/40 bg-amber-500/10 rounded-md p-4 flex flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-medium text-amber-700">Set your availability</h2>
                        <p className="text-xs text-amber-700/80">
                            This is a live gig — set your available time slots before publishing.
                        </p>
                    </div>
                    <SellerAvailabilityForm
                        onSaved={() => setAvailabilityCount((c) => (c ?? 0) + 1)}
                    />
                </section>
            )}

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || needsAvailability}
                    className="bg-muted-foreground hover:bg-foreground rounded-xs cursor-pointer"
                >
                    {isSubmitting
                        ? "Publish..."
                        : needsAvailability
                            ? "Set availability first"
                            : "Publish"}
                </Button>
        </main>
    )
}