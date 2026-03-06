import { db } from '@/db';
import { users, verificationRequests, testimonies, events } from '@/db/schema';
import { eq, ilike, or, desc, isNotNull, and } from 'drizzle-orm';
import { createServerFn } from "@tanstack/react-start";
export const getAllUsersFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    try {
    let dbQuery = db.select().from(users).orderBy(desc(users.createdAt));

    if (query) {
        const lowerQuery = `%${query.toLowerCase()}%`;
        // Note: ilike is case-insensitive
        const whereClause = or(
            ilike(users.name, lowerQuery),
            ilike(users.email, lowerQuery),
            ilike(users.city, lowerQuery),
            ilike(users.country, lowerQuery)
        );
        return await db.select().from(users).where(whereClause).orderBy(desc(users.createdAt));
    }

    return await dbQuery;
} catch (error) {
    console.error('Failed to get users:', error);
    return [];
}
  });

export const getAllUsers = getAllUsersFn;
export const getPublicUsersFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    try {
    // Return users who have public location enabled and have coordinates
    return await db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        lastName: users.lastName,
        city: users.city,
        country: users.country,
        profilePictureUrl: users.profilePictureUrl,
        coords: users.coords,
        bio: users.bio,
        tags: users.tags,
        isTraveler: users.isTraveler,
        languages: users.languages,
        whatsAppLink: users.whatsAppLink,
        instagramLink: users.instagramLink,
        facebookLink: users.facebookLink,
        twitterLink: users.twitterLink,
        telegramUsername: users.telegramUsername,
        blogLink: users.blogLink,
        websiteLink: users.websiteLink,
        visibilitySettings: users.visibilitySettings,
    })
        .from(users)
        .where(and(
            eq(users.isLocationPublic, true),
            isNotNull(users.coords),
            eq(users.isApproved, true)
        ));
} catch (error) {
    console.error('Failed to get public users:', error);
    return [];
}
  });

export const getPublicUsers = getPublicUsersFn;
export const deleteUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    try {
    // Delete all references to this user before deleting the user
    // Note: neon-http doesn't support transactions, so we do sequential deletes

    // 1. Delete verification requests where user is requester or verifier
    await db.delete(verificationRequests).where(eq(verificationRequests.requesterId, id));
    await db.delete(verificationRequests).where(eq(verificationRequests.verifierId, id));

    // 2. Delete testimonies authored by this user
    // Note: testimony recommendations cascade delete based on schema definition
    await db.delete(testimonies).where(eq(testimonies.authorId, id));

    // 3. Delete events organized by this user
    await db.delete(events).where(eq(events.organizerId, id));

    // 4. Finally, delete the user
    await db.delete(users).where(eq(users.id, id));

    
    return { success: true };
} catch (error: any) {
    console.error('Failed to delete user:', error);
    return { success: false, error: error.message };
}
  });

export const deleteUser = deleteUserFn;
export const searchSponsorsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 2) return [];

try {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select({
        id: users.id,
        name: users.name,
        avatarUrl: users.profilePictureUrl,
    })
        .from(users)
        .where(and(
            ilike(users.name, lowerQuery),
            // eq(users.isLocationPublic, true) // Optional: only public users can be sponsors?
        ))
        .limit(10);
} catch (error) {
    console.error('Failed to search sponsors:', error);
    return [];
}
  });

export const searchSponsors = searchSponsorsFn;
export const getHomepageDataFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    try {
    const approvedUsers = await db.select({
        id: users.id,
        coords: users.coords,
        country: users.country,
    })
        .from(users)
        .where(and(
            eq(users.isApproved, true),
            isNotNull(users.coords),
            eq(users.isLocationPublic, true)
        ));

    const totalUsers = approvedUsers.length;
    const totalCountries = new Set(approvedUsers.map(u => u.country).filter(Boolean)).size;

    // Shuffle pins to make it feel dynamic but don't leak who is where
    const pins = approvedUsers.map(u => ({
        id: u.id,
        coords: u.coords,
        country: u.country
    }));

    return {
        totalUsers,
        totalCountries,
        pins
    };
} catch (error: any) {
    console.error('Failed to get homepage data:', error.message);
    return { totalUsers: 0, totalCountries: 0, pins: [] };
}
  });

export const getHomepageData = getHomepageDataFn;
