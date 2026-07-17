import { ReactNode } from "react";

interface TrustBadge {
  icon: ReactNode;
  label: string;
}

interface TrustBadgesRowProps {
  badges: TrustBadge[];
}

export function TrustBadgesRow({ badges }: TrustBadgesRowProps) {
  return (
    // flex-wrap so it degrades gracefully on narrow screens instead of overflowing
    <div className="flex flex-wrap justify-center gap-6 py-6 border-y">
      {badges.map((b, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          {b.icon}
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}