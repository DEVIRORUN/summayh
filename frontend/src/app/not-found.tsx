import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="flex flex-col items-center gap-2 min-w-0">
        <span className="text-7xl font-bold text-foreground tracking-tighter">404</span>
        <h1 className="text-xl font-semibold text-foreground mt-2 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {"The page you are looking for doesn't exist, has been moved, or is currently unavailable."}
        </p>
        
        <div className="mt-6">
          <Button asChild className="rounded-xs text-xs font-medium px-6 cursor-pointer">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}