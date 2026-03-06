import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile, tagToKey } from '@/lib/types';
import { X, Globe, MessageSquare, Instagram } from 'lucide-react';
import { useTranslation } from "react-i18next";

// Helper to build social URL from username (only for Telegram which stores username only)
const buildTelegramUrl = (username: string): string => {
  if (!username) return '';
  // Remove @ if present
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
  const showBio = isMock || (profile.visibilitySettings?.showBio ?? true);
  const showLangs = isMock || (profile.visibilitySettings?.showLanguages ?? true);
  const showWhatsApp = isMock || (profile.visibilitySettings?.showWhatsAppLink ?? true);
  const showInsta = isMock || (profile.visibilitySettings?.showInstagramLink ?? true);
  const showFacebook = isMock || (profile.visibilitySettings?.showFacebookLink ?? true);
  const showTwitter = isMock || (profile.visibilitySettings?.showTwitterLink ?? true);
  const showTelegram = isMock || (profile.visibilitySettings?.showTelegramUsername ?? true);
  const showBlog = isMock || (profile.visibilitySettings?.showBlogLink ?? true);
  const showWebsite = isMock || (profile.visibilitySettings?.showWebsiteLink ?? true);

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
          <span className="sr-only">Fechar</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={avatarUrl}
            alt={`Avatar de ${profile.name}`}
            width={60}
            height={60}
            data-ai-hint={profile.imageHint}
            className={`rounded-full border-2 ${profile.isTraveler ? 'border-amber-500' : 'border-accent'}`}
          />
          <div className="flex flex-wrap gap-1">
            {profile.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {t(`tags.${tagToKey[tag] || tag}`, tag)}
              </Badge>
            ))}
          </div>
        </div>

        {isMock && (
          <p className="text-sm text-muted-foreground mb-4">
            Junte-se à comunidade para se conectar com membros reais.
          </p>
        )}

        {!isMock && showBio && profile.bio && (
          <p className="text-sm text-muted-foreground mb-4">
            {profile.bio}
          </p>
        )}


        {!isMock && showLangs && profile.languages && profile.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {profile.languages.map((lang) => (
                <Badge key={lang} variant="outline">{lang}</Badge>
              ))}
            </div>
          </div>
        )}

        {!isMock && (
          <div className="flex flex-wrap justify-start gap-2">
            {showWhatsApp && profile.whatsAppLink && (
              <Button size="sm" asChild>
                <a href={profile.whatsAppLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            )}
            {showInsta && profile.instagramLink && (
              <Button size="sm" variant="outline" asChild>
                <a href={profile.instagramLink} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-4 w-4" /> Instagram
                </a>
              </Button>
            )}
            {showFacebook && profile.facebookLink && (
              <Button size="sm" variant="outline" asChild>
                <a href={profile.facebookLink} target="_blank" rel="noopener noreferrer">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.791 1.657-2.791 3.914v2.118h2.612l-1.97 3.667H9.101v7.98h2.464v-7.98h2.464l1.97-3.667h1.036v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.791 1.657-2.791 3.914v2.118h2.612l-1.97 3.667H9.101v7.98z" />
                  </svg> Facebook
                </a>
              </Button>
            )}
            {showTwitter && profile.twitterLink && (
              <Button size="sm" variant="outline" asChild>
                <a href={profile.twitterLink} target="_blank" rel="noopener noreferrer">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg> X (Twitter)
                </a>
              </Button>
            )}
            {showTelegram && profile.telegramUsername && (
              <Button size="sm" variant="outline" asChild>
                <a href={buildTelegramUrl(profile.telegramUsername)} target="_blank" rel="noopener noreferrer">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg> Telegram
                </a>
              </Button>
            )}
            {showWebsite && profile.websiteLink && (
              <Button size="sm" variant="outline" asChild>
                <a href={profile.websiteLink} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> Website
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
