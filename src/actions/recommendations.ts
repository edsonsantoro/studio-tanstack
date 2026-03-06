import { db } from '@/db';
import { testimonies, testimonyRecommendations, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { analyzeTestimonyForMaterials } from '@/lib/ai';
import { searchHotmartProduct } from '@/lib/hotmart';
import { getUser } from '@/lib/auth';
import { createServerFn } from "@tanstack/react-start";
export const processTestimonyForRecommendationsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: testimonyId }) => {
    try {
    const testimony = await db.select().from(testimonies).where(eq(testimonies.id, testimonyId)).limit(1);
    if (!testimony.length) return;

    const content = `${testimony[0].title} ${testimony[0].content}`;
    const materials = await analyzeTestimonyForMaterials(content);

    if (materials.length === 0) return;

    for (const material of materials) {
        const product = await searchHotmartProduct(material);

        // We save it even if product is null, but with the material name Gemini found
        // so Admin can maybe manually find it or we show it as a "mention"
        await db.insert(testimonyRecommendations).values({
            testimonyId,
            materialName: material,
            productData: product || {},
            adminStatus: 'pending',
            userStatus: 'pending',
        });
    }

    
} catch (error) {
    console.error("Failed to process recommendations:", error);
}
  });

export const processTestimonyForRecommendations = processTestimonyForRecommendationsFn;
export const getPendingRecommendationsForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    try {
    return await db.select({
        id: testimonyRecommendations.id,
        materialName: testimonyRecommendations.materialName,
        productData: testimonyRecommendations.productData,
        testimonyTitle: testimonies.title,
        testimonyId: testimonies.id,
        authorName: users.name,
    })
        .from(testimonyRecommendations)
        .innerJoin(testimonies, eq(testimonyRecommendations.testimonyId, testimonies.id))
        .innerJoin(users, eq(testimonies.authorId, users.id))
        .where(eq(testimonyRecommendations.adminStatus, 'pending'))
        .orderBy(desc(testimonyRecommendations.createdAt));
} catch (error) {
    console.error("Error fetching admin recommendations:", error);
    return [];
}
  });

export const getPendingRecommendationsForAdmin = getPendingRecommendationsForAdminFn;
export const approveRecommendationByAdminFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    const session = await getUser();
if (session?.role !== 'admin') return { success: false, message: "Unauthorized" };

try {
    await db.update(testimonyRecommendations)
        .set({ adminStatus: 'approved' })
        .where(eq(testimonyRecommendations.id, id));

    
    // Notification for user could be added here
    return { success: true };
} catch (error) {
    return { success: false };
}
  });

export const approveRecommendationByAdmin = approveRecommendationByAdminFn;
export const rejectRecommendationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    const session = await getUser();
if (!session) return { success: false };

try {
    await db.update(testimonyRecommendations)
        .set({ adminStatus: 'rejected', userStatus: 'rejected' })
        .where(eq(testimonyRecommendations.id, id));

    
    return { success: true };
} catch (error) {
    return { success: false };
}
  });

export const rejectRecommendation = rejectRecommendationFn;
export const getPendingRecommendationsForUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    const session = await getUser();
if (!session) return [];

try {
    return await db.select({
        id: testimonyRecommendations.id,
        materialName: testimonyRecommendations.materialName,
        productData: testimonyRecommendations.productData,
        testimonyTitle: testimonies.title,
    })
        .from(testimonyRecommendations)
        .innerJoin(testimonies, eq(testimonyRecommendations.testimonyId, testimonies.id))
        .where(and(
            eq(testimonies.authorId, session.userId),
            eq(testimonyRecommendations.adminStatus, 'approved'),
            eq(testimonyRecommendations.userStatus, 'pending')
        ));
} catch (error) {
    return [];
}
  });

export const getPendingRecommendationsForUser = getPendingRecommendationsForUserFn;
export const approveRecommendationByUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    const session = await getUser();
if (!session) return { success: false };

try {
    await db.update(testimonyRecommendations)
        .set({ userStatus: 'approved' })
        .where(eq(testimonyRecommendations.id, id));

    
    
    return { success: true };
} catch (error) {
    return { success: false };
}
  });

export const approveRecommendationByUser = approveRecommendationByUserFn;
export const getApprovedRecommendationsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: testimonyId }) => {
    try {
    return await db.select()
        .from(testimonyRecommendations)
        .where(and(
            eq(testimonyRecommendations.testimonyId, testimonyId),
            eq(testimonyRecommendations.adminStatus, 'approved'),
            eq(testimonyRecommendations.userStatus, 'approved')
        ));
} catch (error) {
    return [];
}
  });

export const getApprovedRecommendations = getApprovedRecommendationsFn;
export const approveRecommendation = approveRecommendationByUser;
