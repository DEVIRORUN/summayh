"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/axiom/AuthCard";
import { AuthForm } from "@/components/axiom/AuthForm";
import { SocialAuthButtons } from "@/components/axiom/SocialAuthButtonProps";
import { useAuth } from "@/contexts/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLogin(values: { email: string; password: string }) {
    setIsSubmitting(true);
    setError(undefined);

    try {
      const res = await fetch("api/auth/signup", {
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
    // any strategy??
    window.location.href = "api/auth/google";
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join SUMMAYH to hire or get hired"
      footer={
        <span>
          {"Already have an account? "}
          <Link href="/login" className="text-primary font-medium underline">
            log in
          </Link>
        </span>
      }
    >
      <AuthForm
        mode="signup"
        onSubmit={handleLogin}
        isSubmitting={isSubmitting}
        error={error}
      />
      <SocialAuthButtons onGoogleAuth={handleGoogleAuth} />
    </AuthCard>
  );
}
