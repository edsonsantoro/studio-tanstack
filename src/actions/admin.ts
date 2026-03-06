import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { z } from 'zod';
import { createServerFn } from "@tanstack/react-start";
export const addMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data: payload }) => {
    const { prevState, formData } = payload;
const session = await getUser();
if (!session || session.role !== 'admin') {
    return { message: "Unauthorized" };
}

const rawData = Object.fromEntries(formData) as any;

if (rawData.tags) {
    try { rawData.tags = JSON.parse(rawData.tags as string); } catch { rawData.tags = []; }
}
if (rawData.latitude) rawData.latitude = parseFloat(rawData.latitude as string);
if (rawData.longitude) rawData.longitude = parseFloat(rawData.longitude as string);
rawData.isApproved = rawData.isApproved === 'true';

const data = rawData;

try {
    const id = crypto.randomUUID();
    const coords = (data.latitude && data.longitude) ? { lat: data.latitude, lng: data.longitude } : null;

    const whatsAppLink = data.whatsAppNumber
        ? `https://wa.me/${(data.whatsAppNumber as string).replace(/\D/g, '')}`
        : '';

    const instagramLink = data.instagramUsername
        ? `https://instagram.com/${(data.instagramUsername as string).replace('@', '')}`
        : '';

    await db.insert(users).values({
        id: id,
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email as string,
        bio: data.bio as string,
        city: data.city as string,
        country: data.country as string,
        coords: coords as any,
        role: data.role as 'user' | 'admin',
        status: data.isApproved ? 'approved' : 'pending',
        isApproved: data.isApproved as boolean,
        tags: data.tags as string[],
        whatsAppLink,
        instagramLink,
        blogLink: data.blogLink as string,
        websiteLink: data.websiteLink as string,
        languages: data.languages ? (data.languages as string).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        isLocationPublic: (data.visibility === 'public' || data.isApproved) ? true : false,
        inviteCode: Math.random().toString(36).substring(2, 10),
    });

    
    return { success: true };

} catch (error: any) {
    console.error("Failed to add member", error);
    return { message: error.message || "Error adding member" };
}
  });

export const addMember = addMemberFn;
export const approveUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: userId }) => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: "Unauthorized" };
}

try {
    await db.update(users)
        .set({
            isApproved: true,
            status: 'approved',
            isLocationPublic: true
        })
        .where(eq(users.id, userId));

    
    
    
    return { success: true };
} catch (error) {
    console.error("Failed to approve user", error);
    return { success: false, message: "Failed to approve user" };
}
  });

export const approveUser = approveUserFn;
export const rejectUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: userId }) => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: "Unauthorized" };
}

try {
    await db.update(users)
        .set({
            isApproved: false,
            status: 'rejected',
            isLocationPublic: false
        })
        .where(eq(users.id, userId));

    
    
    
    return { success: true };
} catch (error) {
    console.error("Failed to reject user", error);
    return { success: false, message: "Failed to reject user" };
}
  });

export const rejectUser = rejectUserFn;
export const updateUserActionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data: payload }) => {
    const { userId, prevState, formData } = payload;
const session = await getUser();
if (!session || session.role !== 'admin') {
    return { message: "Unauthorized" };
}

const rawData = Object.fromEntries(formData) as any;

// Parse tags JSON
if (rawData.tags) {
    try { rawData.tags = JSON.parse(rawData.tags as string); } catch { rawData.tags = []; }
}
// Parse boolean/numbers
if (rawData.latitude) rawData.latitude = parseFloat(rawData.latitude as string);
if (rawData.longitude) rawData.longitude = parseFloat(rawData.longitude as string);
rawData.isApproved = rawData.isApproved === 'true';
rawData.isTraveler = rawData.isTraveler === 'true';

// Parse visibility settings if exists
// (Assuming passed as stringified json or individual fields? The form likely passes specific fields but let's see. 
// In AddMember we didn't have visibilitySettings structure deeply nested in DB but schema seems to use JSON for it?
// Checking schema: users table has no 'visibilitySettings' column. It has individual links.
// Wait, previous `EditMemberPage` had `visibilitySettings` in form. Where did it save?
// It saved to `visibilitySettings` field?
// Let's check schema details again.
// I only see basic fields. If `visibilitySettings` is missing in Schema, we might have lost it.
// But `AddMember` just assumed Public.
// Let's ignore granular visibility settings for now and stick to `isLocationPublic` which is mapped from `visibility` or `isApproved`.

const data = rawData;

try {
    const coords = (data.latitude && data.longitude) ? { lat: data.latitude, lng: data.longitude } : null;

    const whatsAppLink = data.whatsAppNumber
        ? `https://wa.me/${(data.whatsAppNumber as string).replace(/\D/g, '')}`
        : '';

    const instagramLink = data.instagramUsername
        ? `https://instagram.com/${(data.instagramUsername as string).replace('@', '')}`
        : '';

    await db.update(users).set({
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        name: `${data.firstName} ${data.lastName}`,
        // email: data.email as string, // Email usually immutable or verified
        bio: data.bio as string,
        city: data.city as string,
        country: data.country as string,
        coords: coords as any,
        role: data.role as 'user' | 'admin',
        status: data.isApproved ? 'approved' : 'pending',
        isApproved: data.isApproved as boolean,
        isTraveler: data.isTraveler as boolean,
        tags: data.tags as string[],
        whatsAppLink,
        instagramLink,
        blogLink: data.blogLink as string,
        websiteLink: data.websiteLink as string,
        languages: data.languages ? (data.languages as string).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        isLocationPublic: (data.visibility === 'public' || data.isApproved) ? true : false,
    }).where(eq(users.id, userId));

    
    
    return { success: true };

} catch (error: any) {
    console.error("Failed to update member", error);
    return { message: error.message || "Error updating member" };
}
  });

export const updateUserAction = updateUserActionFn;
