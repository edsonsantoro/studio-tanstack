import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/lib/types';
import { tagToKey } from '@/lib/types';
import { X, Globe, MessageSquare, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const buildTelegramUrl = (username: string): string => {
  if (!username) return '';
  const cleanUsername = username.replace(/^@+/, '');
  return `https://t.me/${cleanUsername}`;
};

type MemberCardProps = {
  profile: UserProfile;
  isMock?: boolean;
  onClose: () => void;
};

export function MemberCard({ profile, isMock = false, onClose }: MemberCardProps) {
  const { t } = useTranslation();
  const showPic = isMock || (profile.visibilitySettings?.showProfilePicture ?? true);
  const avatarUrl = showPic ? (profile.profilePictureUrl || profile.avatarUrl) : `https://avatar.vercel.sh/default.png`;
  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-80 max-w-[90vw] shadow-2xl animate-in fade-in zoom-in-95">
      <CardHeader className="flex flex-row items-start p-4">
        <div className="flex-grow space-y-1">
          <CardTitle className="text-lg">{profile.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{profile.city}, {profile.country}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center space-x-4 mb-4">
          <img src={avatarUrl} alt={profile.name} width={60} height={60} className="rounded-full border-2 border-accent" />
        </div>
      </CardContent>
    </Card>
  );
}
