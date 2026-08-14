const EMAIL_RE = /^[^\s@]+@[^\s@]*\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_RE.test(email.trim());
}