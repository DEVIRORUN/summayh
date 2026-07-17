"use client";

import * as React from "react";
import { ThemeProvider as NextThemeprovider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemeprovider
            attribute="data-theme"
            defaultTheme="cream"
            themes={["cream", "slate", "dark"]}
            enableSystem={false} // set to true if wan supprt OS pereferences
            disableTransitionOnChange 
        >
            {children}
        </NextThemeprovider>
    )
}