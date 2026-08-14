export function isValidEmail(email: string): boolean {
    // Basic, permissive check — has @, has a domain with at least one dot, no spaces
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}