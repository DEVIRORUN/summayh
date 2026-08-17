export function getProfileHref(
  user:
    | {
        username?: string | null;
        role?: string;
        sellerUsername?: string | null;
      }
    | null
    | undefined
): string | null {
  if (!user) return null;

  if (user.role === "SELLER" && user.sellerUsername) {
    return `/seller/${user.sellerUsername}`;
  }

  return user.username ? `/u/${user.username}` : null;
}