
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { z } from 'zod';
import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "vinxi/http";

const visibilitySettingsSchema = z.object({
    showProfilePicture: z.boolean().default(true),
    showBio: z.boolean().default(true),
    showLanguages: z.boolean().default(true),
    showWhatsAppLink: z.boolean().default(true),
    showInstagramLink: z.boolean().default(true),
    showFacebookLink: z.boolean().default(true),
    showTwitterLink: z.boolean().default(true),
    showTelegramUsername: z.boolean().default(true),
    showBlogLink: z.boolean().default(true),
    showWebsiteLink: z.boolean().default(true),
});


const profileSchema = z.object({
    name: z.string().min(2, 'Nome é obrigatório.'),
    bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres.').optional(),
    city: z.string().min(1, 'Cidade é obrigatória.'),
    country: z.string().min(1, 'País é obrigatório.'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isTraveler: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    whatsAppNumber: z.string().optional().or(z.literal('')),
    instagramUsername: z.string().optional().or(z.literal('')),
    facebookLink: z.string().optional().or(z.literal('')),
    twitterLink: z.string().optional().or(z.literal('')),
    telegramUsername: z.string().optional().or(z.literal('')),
    blogLink: z.string().url('URL inválida').optional().or(z.literal('')),
    websiteLink: z.string().url('URL inválida').optional().or(z.literal('')),
    profilePictureUrl: z.string().url('URL inválida.').optional().or(z.literal('')),
    visibility: z.enum(['public', 'restricted', 'hidden']).default('public'),
    languages: z.array(z.string()).optional(),
    visitedCountries: z.array(z.string()).optional(),
    languagePreference: z.string().optional(),
    visibilitySettings: visibilitySettingsSchema.optional(),
});
export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data: payload }) => {
    const { prevState, formData } = payload;
const session = await getUser();
if (!session) {
    return { message: "Unauthorized" };
}

// Parse formData. Handling nested objects and arrays from FormData is tricky.
// We expect the client form to send a JSON string for complex fields or handle them individually.
// For simplicity, let's assume valid JSON body if we were using API, but for Server Action/FormData:
// We can reconstruct the object.

const rawData: any = Object.fromEntries(formData);

// Handle array and nested fields manually if passed as separate keys or parse JSON if passed as string
if (rawData.tags) {
    try {
        rawData.tags = JSON.parse(rawData.tags);
    } catch (e) {
        rawData.tags = [];
    }
}
if (rawData.languages) {
    try {
        rawData.languages = JSON.parse(rawData.languages);
    } catch (e) {
        rawData.languages = [];
    }
}
if (rawData.visitedCountries) {
    try {
        rawData.visitedCountries = JSON.parse(rawData.visitedCountries);
    } catch (e) {
        rawData.visitedCountries = [];
    }
}
if (rawData.visibilitySettings) {
    try {
        rawData.visibilitySettings = JSON.parse(rawData.visibilitySettings);
    } catch (e) {
        // Default
    }
}

// Type coercion
rawData.isTraveler = rawData.isTraveler === 'true';
if (rawData.latitude) rawData.latitude = parseFloat(rawData.latitude);
if (rawData.longitude) rawData.longitude = parseFloat(rawData.longitude);

const result = profileSchema.safeParse(rawData);

if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
}

const data = result.data;
const [firstName, ...lastNameParts] = data.name.split(' ');
const lastName = lastNameParts.join(' ');

// Sanitization functions to extract clean usernames from any input format
const sanitizeUsername = (input: string, patterns: RegExp[]): string => {
    if (!input) return '';
    let cleaned = input.trim();

    // Try to extract from URL patterns
    for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && match[1]) {
            cleaned = match[1];
            break;
        }
    }

    // Remove @ prefix if present
    cleaned = cleaned.replace(/^@+/, '');

    // Remove trailing slashes
    cleaned = cleaned.replace(/\/+$/, '');

    // Remove any remaining URL protocols
    cleaned = cleaned.replace(/^https?:\/\//, '');

    return cleaned;
};

// WhatsApp: extract only numbers
const whatsAppLink = data.whatsAppNumber
    ? `https://wa.me/${data.whatsAppNumber.replace(/\D/g, '')}`
    : '';

// Instagram: handle instagram.com, instagr.am, and plain usernames
const instagramUsername = sanitizeUsername(data.instagramUsername || '', [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([^/?]+)/i,
]);
const instagramLink = instagramUsername ? `https://instagram.com/${instagramUsername}` : '';

// Facebook: handle facebook.com, fb.com, fb.me, and plain usernames
const facebookUsername = sanitizeUsername(data.facebookLink || '', [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?fb\.com\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?fb\.me\/([^/?]+)/i,
]);
const facebookLink = facebookUsername ? `https://facebook.com/${facebookUsername}` : '';

// Twitter/X: handle twitter.com, x.com, and plain usernames
const twitterUsername = sanitizeUsername(data.twitterLink || '', [
    /(?:https?:\/\/)?(?:www\.)?twitter\.com\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?]+)/i,
]);
const twitterLink = twitterUsername ? `https://twitter.com/${twitterUsername}` : '';

// Telegram: handle t.me and plain usernames
const telegramUsername = sanitizeUsername(data.telegramUsername || '', [
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?telegram\.me\/([^/?]+)/i,
]);

const coords = (data.latitude && data.longitude) ? { lat: data.latitude, lng: data.longitude } : null;

try {
    await db.update(users).set({
        name: data.name,
        firstName: firstName || '',
        lastName: lastName || '',
        bio: data.bio || '',
        city: data.city,
        country: data.country,
        coords: coords,
        isTraveler: data.isTraveler,
        tags: data.tags || [],
        whatsAppLink,
        instagramLink,
        facebookLink,
        twitterLink,
        telegramUsername: telegramUsername || '',
        blogLink: data.blogLink || '',
        websiteLink: data.websiteLink || '',
        profilePictureUrl: data.profilePictureUrl,
        languages: data.languages || [],
        languagePreference: data.languagePreference,
        visibilitySettings: data.visibilitySettings || {},
        isLocationPublic: data.visibility === 'public',
    }).where(eq(users.id, session.userId));


    // Set language cookie if preference was updated
    if (data.languagePreference) {
        setCookie('NEXT_LOCALE', data.languagePreference, { path: '/' });
    }

    
    
    return { success: true };

} catch (error) {
    console.error("Failed to update profile", error);
    return { message: "Error updating profile" };
}
  });

export const updateProfile = updateProfileFn;
export const updateAvatarFromSocialFn = createServerFn({ method: 'POST' })
  .inputValidator((data: 'google' | 'facebook' | 'twitter') => data)
  .handler(async ({ data: provider }) => {
    const session = await getUser();
if (!session) {
    return { success: false, message: 'Unauthorized' };
}

try {
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    let newAvatarUrl = '';
    if (provider === 'google') {
        newAvatarUrl = user.googleProfilePictureUrl || '';
    } else if (provider === 'facebook') {
        newAvatarUrl = user.facebookProfilePictureUrl || '';
    } else if (provider === 'twitter') {
        newAvatarUrl = user.twitterProfilePictureUrl || '';
    }

    if (!newAvatarUrl) {
        return { success: false, message: 'No social avatar found' };
    }

    await db.update(users).set({
        profilePictureUrl: newAvatarUrl,
    }).where(eq(users.id, session.userId));

    
    return { success: true };
} catch (error) {
    return { success: false, message: 'Failed to update avatar' };
}
  });

export const updateAvatarFromSocial = updateAvatarFromSocialFn;
export const unlinkSocialAccountFn = createServerFn({ method: 'POST' })
  .inputValidator((data: 'google' | 'facebook' | 'twitter') => data)
  .handler(async ({ data: provider }) => {
    const session = await getUser();
if (!session) {
    return { success: false, message: 'Unauthorized' };
}

try {
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
    });

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    // Safety check: User must have a password to unlink social account
    // If they don't have a password, they might be locking themselves out
    if (!user.passwordHash) {
        return { success: false, message: 'password_required' };
    }

    const updateData: any = {};
    if (provider === 'google') {
        updateData.googleId = null;
        updateData.googleProfilePictureUrl = null;
    } else if (provider === 'facebook') {
        updateData.facebookId = null;
        updateData.facebookProfilePictureUrl = null;
    } else if (provider === 'twitter') {
        updateData.twitterId = null;
        updateData.twitterProfilePictureUrl = null;
    }

    await db.update(users).set(updateData).where(eq(users.id, session.userId));

    
    return { success: true };
} catch (error) {
    console.error('Failed to unlink social account:', error);
    return { success: false, message: 'Failed to unlink account' };
}
  });

export const unlinkSocialAccount = unlinkSocialAccountFn;
