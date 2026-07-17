import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { type SellerLevel } from "./SellerMiniRow"; 


interface ProfileHeaderProps {
  bannerUrl?: string;
  avatar: string;
  name: string;
  level?: SellerLevel;
  isOnline: boolean;
  bio?: string;
}

export function ProfileHeader({ bannerUrl, avatar, name, level, isOnline, bio }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col">
      {/* Banner is optional — if the seller hasn't uploaded one, fall back to a
          plain gradient background instead of leaving a broken/empty image */}
      <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
        {bannerUrl && <Image src={bannerUrl} alt="" fill className="object-cover" />}
      </div>

      {/* Avatar overlaps the banner — negative margin pulls it up.
          This is a common profile-header pattern: -mt-10 shifts the avatar
          up by 40px so it sits half on the banner, half below it. */}
      <div className="flex items-end gap-4 px-4 -mt-10">
        <Avatar className="w-20 h-20 ring-4 ring-background">
          <AvatarImage src={avatar} />
        </Avatar>
        <div className="flex flex-col pb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{name}</span>
            {isOnline && <span className="w-2 h-2 rounded-full bg-green-500" />}
          </div>
          {level && <span className="text-xs text-muted-foreground">{level}</span>}
        </div>
      </div>

      {bio && <p className="text-sm text-muted-foreground px-4 mt-3">{bio}</p>}
    </div>
  );
}