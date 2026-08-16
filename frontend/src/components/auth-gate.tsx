"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const PUBLIC_PATHS = ["/", "/search", "/gigs", "/sellers"]; 

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user) return;

    const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    // if (!user.isEmailVerified && !isPublicPath) {
    //   router.push("/verify-email");
    // }
  }, [isLoading, user, pathname, router]);

  return <>{children}</>;
}