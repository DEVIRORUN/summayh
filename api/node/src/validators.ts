// api/node/src/utils/validators.ts

const NIGERIAN_UNI_DOMAINS = [
    "lautech.edu.ng",
    "unilag.edu.ng",
    "ui.edu.ng",
    "oauife.edu.ng",
    "unilorin.edu.ng",
    "abu.edu.ng"
    // Add more Nigerian university domains as needed
]

export const checkEduEmail = (email: string): boolean => {
    if (!email || !email.includes("@")) return false;

    const domain = email.split("@")[1].toLowerCase();
  return NIGERIAN_UNI_DOMAINS.includes(domain);
}