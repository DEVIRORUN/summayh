import crypto from "crypto";

export function hashNin(nin: string): string {
    const normalized = nin.replace(/\s+/g, "");
    return crypto.createHash("sha256").update(normalized).digest("hex");
}