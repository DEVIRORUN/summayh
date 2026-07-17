import React, { useRef } from "react";
import { Input } from "../ui/input";

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    error?: string;
}


export function OTPInput({ length = 6, value, onChange, onComplete, error }: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    function handleChange(index: number, digit: string) {
        const clean = digit.replace(/[^0-9]/g, "").slice(-1);

        const newValue = value.split("");
        newValue[index] = clean;

        const joined = newValue.join("").slice(0, length);
        onChange(joined);

        if (clean && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (joined.length === length && onComplete) {
            onComplete(joined);
        }
    }
    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();

        const pastedData = e.clipboardData.getData("text"); // We get data from clipboard
        const cleanData = pastedData.replace(/^0-9/g, ""); // Cleanup
        const finalOtp = cleanData.slice(0, length); // only up to max length
        onChange(finalOtp); // Update state

        const targetIndex = Math.min(finalOtp.length, length - 1);

        inputRefs.current[targetIndex]?.focus();

        if(finalOtp.length === length && onComplete) {
            onComplete(finalOtp)
        }
    }
    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !value[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-center">
                {Array.from({ length }).map((_, i) => (
                    <Input
                        key={i}
                        ref={(el) => {inputRefs.current[i] = el}}
                        value={value[i] || ""}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        maxLength={1}
                        inputMode="numeric"
                        className="w-10 h-12 text-center text-lg"
                    />
                ))}
                {error && <span className="text-xs text-red-500 text-center">{error}</span>}
            </div>
        </div>
    )

}


