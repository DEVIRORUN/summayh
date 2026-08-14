"use client";

import React, { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleX, Eye, EyeOff } from "lucide-react";
import { EmailInput } from "./EmalInput";
import { isValidEmail } from "@/lib/email";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (values: {
    name?: string;
    email: string;
    password: string;
    dateOfBirth?: string;
    phoneNumber?: string;
  }) => void;
  isSubmitting?: boolean;
  error?: string; // SS errors bruh
}

export function AuthForm({
  mode,
  onSubmit,
  isSubmitting,
  error,
}: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const verificationRules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(password) },
    { label: "At least One numerical digit", valid: /[0-9]/.test(password) },
    {
      label: "At least One special character (e.g. , _, /, !)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const isSignup = mode === "signup";
  const passwordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailValidationError(null)
    
    if (!isValidEmail(email)) {
        setEmailValidationError(
            "Please enter a valid email address."
        );
        return;    
    }

    onSubmit(isSignup ? { name, email, password, dateOfBirth, phoneNumber } : { email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full min-w-0">
      {isSignup && (
        <div className="flex flex-col gap-1.5 w-full">
          <Label className="text-xs font-medium text-foreground">Full name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abdulmalik Idan"
            required
            className="text-sm bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 w-full min-w-0">
        <EmailInput
            value={email}
            onChange={setEmail}
            error={emailValidationError}
            onErrorChange={setEmailValidationError}
            // onSchoolSelected={() => passwordRef.current?.focus()}
        />
      </div>

      {isSignup && (
        <>
          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-xs font-medium text-foreground">Date of birth</Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="text-sm bg-background border-input text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-xs font-medium text-foreground">Phone number</Label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+2348012345678"
              required
              className="text-sm bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5  w-full">
        <Label htmlFor="password" className="text-xs font-medium text-foreground">
          Password
        </Label>
        <div className="relative w-full">   
          <Input
            id="password"
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="........"
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            required
            minLength={8}
            className="bg-background border-input text-foreground placeholder:text-muted-foreground pr-10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} /> }
          </button>
        </div>
       {isSignup && isPasswordFocused && password.length > 1 && (
            <ul className="mt-2 flex flex-col gap-1.5 text-xs bg-muted/40 p-3 rounded-md border border-border">
                {verificationRules.map((r, i) => (
                    <li
                    key={i}
                    className={cn(
                        "flex items-center gap-2 transition-colors duration-150",
                        r.valid
                        ? "text-success"
                        : "text-muted-foreground",
                    )}
                    >
                    {r.valid ? (
                        <CircleCheck className="w-3.5 h-3.5 text-success" />
                    ) : (
                        <CircleX className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className={r.valid ? "line-through opacity-70" : ""}>
                        {r.label}
                    </span>
                    </li>
                ))}
            </ul>
        )}
      </div>

      {error && 
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2.5 font-medium">
          {error}
        </div>}

      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary/80 text-primary-foreground hover:bg-primary font-medium transition-colors mt-1">
        {isSubmitting
          ? "Please wait..."
          : isSignup
            ? "Create account"
            : "Log in"}
      </Button>
    </form>
  );
}
