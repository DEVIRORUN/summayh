"use client";

import { Drawer, DrawerContent } from "../ui/drawer";
import { useSidebar } from "@/contexts/sidebar-context";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";

interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    children: { id: string; name: string; slug: string }[]
}

function CategoryItem({
    category,
    onItemClick,
}: {
    category: CategoryNode;
    onItemClick?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children.length > 0; 

    return (
        <div className="flex flex-col">
            <div className="flex items-center rounded-md hover:bg-muted transition-colors">
                <Link
                    href={`/gigs?category=${category.slug}`}
                    onClick={onItemClick}
                    className="flex-1 px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
                >
                    {category.name}
                </Link>
                {hasChildren && (
                    <Button
                        onClick={() => setIsOpen((o) => !o)}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                        className="px-2 py-2 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight
                            className={cn(
                                "w-3.5 h-3.5 transition-transform",
                                isOpen && "rotate-90"
                            )}
                            />
                    </Button>
                )}
            </div>
            {hasChildren && isOpen && (
                <div className="ml-4 pl-3 border border-border flex flex-col gap-0.5 py-1">
                    {category.children.map((sub) => (
                        <Link
                            key={sub.id}
                            href={`/gigs?category=${sub.slug}`}
                            onClick={onItemClick}
                            className="rounded-md px-2 py-1.5 text-xs text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function SidebarLinks({
    categories,
    onItemClick,
}: {
    categories: CategoryNode[];
    onItemClick?: () => void;
}) {
    return (
        <nav className="flex flex-col gap-1 p-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Categories
            </p>
            {categories.map((cat) => (
                <CategoryItem key={cat.id} category={cat} onItemClick={onItemClick}/>
            ))}
        </nav>
    )
}