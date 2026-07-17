import { EmptyState } from "../axiom/EmptyState";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface PortfolioItem {
  id: string;
  thumbnail: string;
  title: string;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  onItemClick?: (id: string) => void;
}

export function PortfolioGrid({ items, onItemClick }: PortfolioGridProps) {
  if (items.length === 0) {
    // Reusing EmptyState here rather than writing a one-off empty message —
    // this is the payoff of building EmptyState generically early on
    return <EmptyState icon={<ImageIcon className="w-8 h-8" />} title="No portfolio items yet" />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className="relative aspect-square rounded-md overflow-hidden group"
        >
          <Image src={item.thumbnail} alt={item.title} fill sizes="200px" className="object-cover" />
          {/* Title overlay only appears on hover — keeps the grid visually clean by default */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
            <span className="text-white text-xs">{item.title}</span>
          </div>
        </button>
      ))}
    </div>
  );
}