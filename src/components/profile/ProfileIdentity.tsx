import type { Profile } from "../../content/types";

interface ProfileIdentityProps {
  profile: Pick<Profile, "displayName" | "avatar" | "headline">;
  compact?: boolean;
}

export const ProfileIdentity = ({ profile, compact = false }: ProfileIdentityProps) =>
  compact ? (
    <div className="flex items-center gap-3">
      <img src={profile.avatar} alt={profile.displayName} className="w-10 h-10 rounded-full object-cover border-2 border-sage-light" />
      <span className="text-lg font-bold text-sage">{profile.displayName}</span>
    </div>
  ) : (
    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-sage-light">
      <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" />
    </div>
  );
