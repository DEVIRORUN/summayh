"use client";

import React, { createContext, useContext } from "react";
import { DraftGig } from "@/types/draftGig";

interface DraftGigContextValue {
    draft: DraftGig | null;
    refetchDraft: () => Promise<void>;
}


const DraftGigContext = createContext<DraftGigContextValue | undefined>(undefined);


export function DraftGigProvider({
    value,
    children
}: {
    value: DraftGigContextValue;
    children: React.ReactNode;
}) {
    return (
        <DraftGigContext.Provider value={value}>
            {children}
        </DraftGigContext.Provider>
    );
}

export function useDraftGig(): DraftGigContextValue {
    const ctx = useContext(DraftGigContext);
    if (ctx === undefined) {
        throw new Error("useDraftGig must be used within a DraftGigProvider");
    }
    return ctx;
}