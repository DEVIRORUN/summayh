"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refetch } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.push("/login?error=oauth_failed");
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: data.session.access_token }),
      });

      if (!res.ok) {
        router.push("/login?error=oauth_failed");
        return;
      }

      await supabase.auth.signOut(); 
      await refetch();
      router.push("/");
    }

    handleCallback();
  }, [router, refetch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="animate-pulse">Signing you in...</p>
    </div>
  );
}