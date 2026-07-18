"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
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
  const [bio, setBio] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountBank, setAccountBank] = useState("");
  const [bankError, setBankError] = useState<string | null>(null);
  const [skills, setSkills] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    if (!accountBank) {
      setBankError("Please select a valid bank from the suggestions dropdown.");
      return;
    }

    try {
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: name,
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
    accountNumber.length < 10 || // NUBAN accounts are exactly 10 digits
    !accountBank ||
    !skills.trim() ||
    isSubmitting;

  return (
    <div className="h-full flex flex-row sm:flex-col gap-7.5 max-w-md mx-auto py-16 px-4">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-1 text-center">Become a seller</h1>
        <p className="text-xs font-normal mb-1 text-center">
          Tell us a bit about what you do.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="h-full flex flex-col gap-4">
        <div className="group flex flex-col rounded-xl border border-muted-foreground/20 bg-background/50 p-3 shadow-sm transition-all duration-200 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
          <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-foreground">
            Display Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-auto border-0 p-0 pt-1 text-sm bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="e.g. Alex Rivera"
          />
        </div>

        <div className="group flex flex-col rounded-xl border border-muted-foreground/20 bg-background/50 p-3 shadow-sm transition-all duration-200 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
          <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-foreground">
            Bio
          </Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className="h-auto border-0 p-0 pt-1 text-sm bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="e.g. I focus on..."
          />
        </div>

        <div className="group flex flex-col rounded-xl border border-muted-foreground/20 bg-background/50 p-3 shadow-sm transition-all duration-200 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
          <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-foreground">
            Account Number
          </Label>
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
            className="h-auto border-0 p-0 pt-1 text-sm bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-medium"
          />
        </div>

        <BankInput
          inputValue={bankName}
          onInputChange={setBankName}
          onBankSelect={setAccountBank}
          error={bankError}
          onErrorChange={setBankError}
        />

        <div className="group flex flex-col rounded-xl border border-muted-foreground/20 bg-background/50 p-3 shadow-sm transition-all duration-200 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
          <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors group-focus-within:text-foreground">
            Skills (comma separated)
          </Label>
          <Input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. video editing, coding, voice acting"
            required
            /* 💡 Clean visual styling to match the premium container token */
            className="h-auto border-0 p-0 pt-1 text-sm bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 font-medium"
          />
        </div>

        {error && <span className="text-xs text-red-500">{error}</span>}

        <section className="flex items-center gap-4">
          <Input
            required
            className="h-4 w-4"
            type="checkbox" 
            value="" 
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <p>I agree to the Terms & Conditions and Privacy Policy</p>
        </section>

        <Button
          type="submit"
          className="cursor-pointer bg-foreground hover:bg-muted-foreground"
          disabled={isFormInvalid}
          suppressHydrationWarning
        >
          {isSubmitting ? "Setting up..." : "Continue to create your first gig"}
        </Button>
      </form>
    </div>
  );
}
