// Components
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
// import { Footer } from "@/components/footer";
import { getCategories } from "@/lib/categories";
import React from "react";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const categories = await getCategories();

    return (
        <div className="flex min-h-screen min-w-screen">
            {/* <Sidebar categories={categories} /> */}
            <div className="flex flex-1 flex-col min-w-0">
                <Navbar />
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    )
}

