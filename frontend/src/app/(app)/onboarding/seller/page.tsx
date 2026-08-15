"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BankInput } from "@/components/shared/BankSearchHandler";

interface BankInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onBankSelect: (code: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState(""); //accountName
  const [username, setUsername] = useState(""); //accountName
  const [bio, setBio] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountBank, setAccountBank] = useState("");
  const [bankError, setBankError] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");


  const checkUsername = useCallback(async (username: string) => {
    if (username.trim().length < 3) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch(`/api/seller/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setStatus(data.available ? "available" : "taken");
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => checkUsername(username), 400); // debounce
    return () => clearTimeout(timeout);
  }, [username, checkUsername]);

  async function handleSubmit() {
    setError(undefined);
    
    if (!accountBank) {
      setBankError("Please select a valid bank from the suggestions dropdown.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: name,
          sellerUsername: username,
          biography: bio,
          accountNumber,
          settlementBank: accountBank,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || data.message || "Could not complete onboarding",
        );
      }

      router.push("/gigs/new"); // I wire this rn so straight to gig creation [For now]
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong trying to board seller",
      );
    } finally {
      setIsSubmitting(false);
    }

    console.log({ name, accountBank });
  }
  const isFormInvalid =
    !name.trim() ||
    !bio.trim() ||
    !username.trim() ||
    status !== "available" ||
    accountNumber.length !== 10|| // NUBAN accounts are exactly 10 digits
    !accountBank ||
    !skills.trim() ||
    !isChecked ||
    isSubmitting;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="p-4 sm:p-5 min-w-0">
        <h1 className="text-2xl font-bold text-foreground">Become a seller</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us a bit about what you do so buyers can get to know you.
        </p>
      </div>

      <div className="text-muted-foreground bg-card border border-border rounded-xs flex flex-col gap-6 m-4 sm:m-5 p-4 sm:p-6 shadow-xs min-w-0">
        
        {/* DISPLAY NAME SECTION */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Display Name</span>
            <div className="text-xs text-muted-foreground mt-1">
              Your public seller name.{" "}
              <span className="font-medium text-foreground/80">
                Make sure this is your real name, matching your banks details.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xs text-xs w-full bg-background"
              placeholder="e.g. Abdulmalik Ahmed"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Username</span>
            <div className="text-xs text-muted-foreground mt-1">
              The name for you alone .{" "}
              <span className="font-medium text-foreground/80">
                This is how you will appear to buyers across the marketplace.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="relative max-w-50">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                className="max-w-50 rounded-xs text-xs w-full bg-background pr-8"
                placeholder="e.g. Idan"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {status === "available" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {status === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            {status === "taken" && <p className="text-xs text-destructive">Username already taken.</p>}
            {status === "available" && <p className="text-xs text-green-600">Username available.</p>}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* BIO SECTION */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Biography</span>
            <div className="text-xs text-muted-foreground mt-1">
              Share your experience and expertise. Keep it professional and punchy.
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="rounded-xs text-xs h-24 min-h-24 max-h-24 resize-none w-full bg-background"
              placeholder="e.g. I offer professional DaVinci Resolve editing and custom full-stack web development..."
            />
          </div>
        </div>

        <hr className="border-border/60" />

        {/* FINANCIALS SECTION */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Payout Details</span>
            <div className="text-xs text-muted-foreground mt-1">
              Where should we send your earnings? These details remain private.
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-xs text-foreground block mb-1">Account Number</span>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]*"
                value={accountNumber}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, "");
                  setAccountNumber(cleanValue);
                }}
                required
                placeholder="0123456789"
                className="rounded-xs text-xs w-full bg-background font-medium"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-xs text-foreground block mb-1">Bank Name</span>
              <BankInput
                inputValue={bankName}
                onInputChange={setBankName}
                onBankSelect={setAccountBank}
                error={bankError}
                onErrorChange={setBankError}
              />
            </div>
          </div>
        </div>

        <hr className="border-border/60" />

        {/* SKILLS SECTION */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 min-w-0 w-full">
          <div className="flex flex-col w-full md:w-[280px] shrink-0">
            <span className="font-semibold text-foreground text-sm">Top Skills</span>
            <div className="text-xs text-muted-foreground mt-1">
              List your strongest disciplines so we can match you with the right opportunities.
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="font-semibold text-xs text-foreground block mb-1">Skills (comma separated)</span>
            <Input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. video editing, Next.js, 3D modeling"
              required
              className="rounded-xs text-xs w-full bg-background"
            />
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <p className="text-xs text-destructive px-5 font-medium pt-2">
            {error}
          </p>
        )}

        {/* SUBMISSION FOOTER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pr-4 pt-4 border-t border-border/40 gap-4">
          <div className="flex items-center gap-2 pl-2">
            <input
              id="terms"
              type="checkbox"
              required
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring cursor-pointer accent-foreground"
            />
            <label htmlFor="terms" className="text-xs text-foreground cursor-pointer select-none">
              I agree to the Terms & Conditions and Privacy Policy
            </label>
          </div>
          
          <Button
            onClick={() => handleSubmit()}
            disabled={isFormInvalid}
            className="rounded-xs font-medium text-xs px-5 cursor-pointer w-full sm:w-auto"
            suppressHydrationWarning
          >
            {isSubmitting ? "Saving..." : "Save & Continue"}
          </Button>
        </div>

      </div>
    </div>
  );
}
