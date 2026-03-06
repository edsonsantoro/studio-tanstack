import { z } from 'zod';

const visibilitySettingsSchema = z.object({
  showProfilePicture: z.boolean().default(true),
  showBio: z.boolean().default(true),
  showLanguages: z.boolean().default(true),
  showWhatsAppLink: z.boolean().default(true),
  showInstagramLink: z.boolean().default(true),
  showBlogLink: z.boolean().default(true),
  showWebsiteLink: z.boolean().default(true),
});

export const addMemberFormSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório.'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório.'),
  email: z.string().email('Email inválido.'),
  city: z.string().min(1, 'Cidade é obrigatória.'),
  country: z.string().min(1, 'País é obrigatório.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bio: z.string().max(300, 'Bio deve ter no máximo 300 caracteres.').optional(),
  tags: z.array(z.string()).optional(),
  whatsAppNumber: z.string().optional().or(z.literal('')),
  instagramUsername: z.string().optional().or(z.literal('')),
  blogLink: z.string().url('URL inválida').optional().or(z.literal('')),
  websiteLink: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.enum(['user', 'admin']).default('user'),
  isApproved: z.boolean().default(true),
  languages: z.string().optional(),
  visibilitySettings: visibilitySettingsSchema.optional(),
});

export const editMemberFormSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório.'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório.'),
  city: z.string().min(1, 'Cidade é obrigatória.'),
  country: z.string().min(1, 'País é obrigatória.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bio: z.string().max(300, 'Bio deve ter no máximo 300 caracteres.').optional(),
  tags: z.array(z.string()).optional(),
  whatsAppNumber: z.string().optional().or(z.literal('')),
  instagramUsername: z.string().optional().or(z.literal('')),
  blogLink: z.string().url('URL inválida').optional().or(z.literal('')),
  websiteLink: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.enum(['user', 'admin']),
  isApproved: z.boolean(),
  isTraveler: z.boolean(),
  visibility: z.enum(['public', 'restricted', 'hidden']),
  languages: z.string().optional(),
  visibilitySettings: visibilitySettingsSchema.optional(),
});

export const eventFormSchema = z.object({
  name: z.string().min(3, 'O nome do evento deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  dates: z.array(z.date()).min(1, 'Selecione pelo menos uma data para o evento.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido. Use HH:mm.").optional().or(z.literal('')),
  durationHours: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().positive('A duração deve ser um número positivo.').optional()
  ),
  recurrenceDescription: z.string().optional(),
  isOnline: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  location: z.string().optional(),
  onlineUrl: z.string().url('Por favor, insira uma URL válida.').optional().or(z.literal('')),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrl: z.string().url('Por favor, insira uma URL de imagem válida.').optional().or(z.literal('')),
  requiresRSVP: z.boolean().default(false),
  postEventDescription: z.string().optional(),
  postEventImageUrls: z.string().optional(), // Comma separated URLs
}).refine(data => !data.isOnline ? !!data.location && data.location.length > 0 : true, {
  message: 'A localização é obrigatória para eventos presenciais.',
  path: ['location'],
}).refine(data => data.isOnline ? !!data.onlineUrl && data.onlineUrl.length > 0 : true, {
  message: 'A URL do evento online é obrigatória.',
  path: ['onlineUrl'],
});


export const postEventFormSchema = z.object({
  postEventDescription: z.string().optional(),
  postEventImageUrls: z.string().optional(),
});

export const testimonyFormSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  content: z.string().min(50, 'O testemunho deve ter pelo menos 50 caracteres.'),
  videoUrl: z.string().url('Por favor, insira uma URL de vídeo válida.').optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
});
