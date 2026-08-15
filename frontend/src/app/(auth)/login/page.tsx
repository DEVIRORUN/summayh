"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/axiom/AuthCard";
import { AuthForm } from "@/components/axiom/AuthForm";
import { SocialAuthButtons } from "@/components/axiom/SocialAuthButtonProps";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLogin(values: { email: string; password: string }) {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid email or password");
      }
      
      await refetch();
      router.push("/"); // redirect to homepage
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleAuth() {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      }
    });
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue to SUMMAYH"
      footer={
        <p className="text-xs text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors">
            Sign up
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-5 min-w-0">
        <AuthForm
          mode="login"
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          error={error}
        />
        <SocialAuthButtons onGoogleAuth={handleGoogleAuth} />
      </div>
    </AuthCard>
  );
}
