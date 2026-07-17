import { SellerMiniRow, type SellerLevel } from "../axiom/SellerMiniRow";
import { RatingInline } from "../axiom/RatingInline";

interface GigTitleBlockProps {
  title: string;
  category: string;
  seller: { avatar: string; name: string; isOnline: boolean; level?: SellerLevel };
  rating: { avgRating: number; reviewCount?: number };
}

export function GigTitleBlock({ title, category, seller, rating }: GigTitleBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{category}</span>
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <SellerMiniRow {...seller} />
        <RatingInline avgRating={rating.avgRating} reviewCount={rating.reviewCount} />
      </div>
    </div>
  );
}