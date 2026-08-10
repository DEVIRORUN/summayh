"use client";

import * as React from "react";
import { ThemeProvider as NextThemeprovider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemeprovider
            attribute="class"
            defaultTheme="system"
            themes={["light", "dark"]}
            enableSystem
            disableTransitionOnChange 
        >
            {children}
        </NextThemeprovider>
    )
}