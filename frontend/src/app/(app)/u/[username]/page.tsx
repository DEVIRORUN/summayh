export const dynamic = "force-dynamic";

import { getSellerByUsername } from "@/lib/seller";
import { getUserByUsername } from "@/lib/user";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const seller = await getSellerByUsername(username);

  if (seller?.sellerUsername) {
    redirect(`/seller/${seller.sellerUsername}`);
  }

  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-medium">
              {user.name?.[0] ?? "?"}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{user.name}</h1>

          <p className="text-sm text-muted-foreground">
            @{user.username}
          </p>

          {user.university && (
            <p className="text-sm text-muted-foreground">
              {user.university}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}