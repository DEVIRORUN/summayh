"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/axiom/AuthCard";
import { OTPInput } from "@/components/axiom/OTPInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

const RESEND_COOLDOWN_SEC = 60;

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, refetch } = useAuth();

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentOnce, setSentOnce] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const sendOtp = useCallback(async () => {
        setIsSending(true);
        setError(null);
        try {
            const res = await fetch("/api/email-otp/send", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to send code. Please try again.");
                return;
            }
            setSentOnce(true);
            setCooldown(RESEND_COOLDOWN_SEC);
        } catch (err) {
            console.error("Failed to send OTP:", err);
            setError("Something went wrong sending your code.");
        } finally {
            setIsSending(false);
        }
    }, []);

    // Send the first OTP automatically once we know who the user is
    useEffect(() => {
        if (!authLoading && user && !sentOnce) {
            sendOtp();
        }
    }, [authLoading, user, sentOnce, sendOtp]);

    // If already verified, don't sit on this page
    useEffect(() => {
        if (!authLoading && user?.isEmailVerified) {
            router.push("/");
        }
    }, [authLoading, user, router]);

    // Resend cooldown ticker
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    async function handleVerify() {
        if (otp.length !== 6) return;
        setIsVerifying(true);
        setError(null);
        try {
            const res = await fetch("/api/email-otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
            });
            const data = await res.json();

            if (!res.ok || data.success === false) {
                setError(data.error ?? data.message ?? "Invalid code. Please try again.");
                setOtp("");
                return;
            }

            await refetch();
            router.push("/");
        } catch (err) {
            console.error("Failed to verify OTP:", err);
            setError("Something went wrong verifying your code.");
        } finally {
            setIsVerifying(false);
        }
    }

    if (authLoading) {
        return (
            <div className="flex h-dvh w-full items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <AuthCard
            title="Verify your email"
            subtitle="Enter the 6-digit code sent to your email."
        >
            <div className="flex flex-col gap-4 w-full">
                <OTPInput value={otp} onChange={setOtp} length={6} />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <Button onClick={handleVerify} disabled={otp.length !== 6 || isVerifying} className="w-full">
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify email"
                    )}
                </Button>

                <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isSending || cooldown > 0}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed underline w-fit mx-auto"
                >
                    {isSending
                        ? "Sending..."
                        : cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : "Resend code"}
                </button>
            </div>
        </AuthCard>
    );
}