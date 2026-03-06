export type Tag =
  | 'Graduado EPS'
  | 'Novo na comunidade'
  | 'Líder de grupo local'
  | 'Viajante/Missionário'
  | 'Anfitrião (recebe visitas)'
  | 'Buscando mentoria'
  | 'Disponível para mentorar'
  | 'Estudo bíblico'
  | 'Adoração'
  | 'Missões'
  | 'Intercessão'
  | 'Cyberchurch'
  | 'Ex-Comunidade Sem Limites'
  | 'Time RH'
  | 'Brazilian Kids Kare';

export const allTags: Tag[] = [
  'Graduado EPS',
  'Novo na comunidade',
  'Líder de grupo local',
  'Viajante/Missionário',
  'Anfitrião (recebe visitas)',
  'Buscando mentoria',
  'Disponível para mentorar',
  'Estudo bíblico',
  'Adoração',
  'Missões',
  'Intercessão',
  'Cyberchurch',
  'Ex-Comunidade Sem Limites',
  'Time RH',
  'Brazilian Kids Kare',
];

export const tagToKey: Record<Tag, string> = {
  'Graduado EPS': 'eps_graduate',
  'Novo na comunidade': 'new_to_community',
  'Líder de grupo local': 'local_group_leader',
  'Viajante/Missionário': 'traveler_missionary',
  'Anfitrião (recebe visitas)': 'host',
  'Buscando mentoria': 'seeking_mentorship',
  'Disponível para mentorar': 'available_to_mentor',
  'Estudo bíblico': 'bible_study',
  'Adoração': 'worship',
  'Missões': 'missions',
  'Intercessão': 'intercession',
  'Cyberchurch': 'cyberchurch',
  'Ex-Comunidade Sem Limites': 'ex_community',
  'Time RH': 'hr_team',
  'Brazilian Kids Kare': 'kids_kare',
};

export type VisibilitySettings = {
  showProfilePicture?: boolean;
  showBio?: boolean;
  showLanguages?: boolean;
  showWhatsAppLink?: boolean;
  showInstagramLink?: boolean;
  showFacebookLink?: boolean;
  showTwitterLink?: boolean;
  showTelegramUsername?: boolean;
  showBlogLink?: boolean;
  showWebsiteLink?: boolean;
};

export type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  city: string;
  country: string;
  avatarUrl: string;
  profilePictureUrl?: string; // Legacy/Alias
  imageHint: string;
  bio: string;
  tags: Tag[];
  isTraveler: boolean;
  coords?: { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
  whatsAppLink?: string;
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  telegramUsername?: string;
  blogLink?: string;
  websiteLink?: string;
  languages?: string[];
  visibilitySettings?: VisibilitySettings;
  isLocationPublic?: boolean;
  languagePreference?: string;
  role?: string;
  inviteCode?: string;
  googleId?: string;
  facebookId?: string;
  twitterId?: string;
  googleProfilePictureUrl?: string;
  facebookProfilePictureUrl?: string;
  twitterProfilePictureUrl?: string;
  visitedCountries?: string[];
};

export type Event = {
  id: string;
  name: string;
  description: string;
  dates: (Date | string)[]; // Array of Firestore Timestamps or ISO strings in Postgres

  startTime?: string; // e.g., "14:00"
  durationHours?: number;
  recurrenceDescription?: string;
  organizerId: string;
  organizerName: string;
  isOnline: boolean;
  isPublic?: boolean;
  location?: string;
  onlineUrl?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  attendeeIds?: string[];
  postEventDescription?: string;
  postEventImageUrls?: string[];
  // for map display
  coords?: { lat: number; lng: number };
  imageHint?: string;
};

export type CyberchurchResource = {
  type: 'pdf' | 'video' | 'link';
  title: string;
  url: string;
};

export type CyberchurchMaterial = {
  id: string;
  title: string;
  period: string;
  description: string;
  resources: CyberchurchResource[];
};

export type Testimony = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string | null;
  authorAvatarUrl: string | null;
  videoUrl?: string | null;
  isPublic: boolean | null;
  createdAt: Date | null;
};

export type RoadmapItemWithVotes = any;
export type RoadmapCommentWithUser = any;
