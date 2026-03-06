import { db } from '@/db';
import { testimonies, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { z } from 'zod';
import { redirect } from '@tanstack/react-router';
import { processTestimonyForRecommendations } from './recommendations';
import { createServerFn } from "@tanstack/react-start";

const testimonySchema = z.object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
    content: z.string().min(10, "O testemunho deve ter pelo menos 10 caracteres."),
    videoUrl: z.string().optional().or(z.literal('')),
    isPublic: z.coerce.boolean().optional(),
});
export const createTestimonyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { prevState, formData } = data;
const session = await getUser();
if (!session) {
    throw redirect({ to: '/login' as any });
}

const result = testimonySchema.safeParse(Object.fromEntries(formData));
if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
}

const { title, content, isPublic, videoUrl } = result.data;

try {
    const insertResult = await db.insert(testimonies).values({
        authorId: session.userId,
        title,
        content,
        videoUrl: videoUrl || null,
        isPublic: isPublic || false,
    }).returning({ id: testimonies.id });

    if (insertResult[0]?.id) {
        processTestimonyForRecommendations({ data: insertResult[0].id });
    }

    
    return { success: true };
} catch (error) {
    console.error("Failed to create testimony", error);
    return { message: "Erro ao salvar testemunho." };
}
  });

export const createTestimony = createTestimonyFn;
export const getPublicTestimoniesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    try {
    return await db.select({
        id: testimonies.id,
        title: testimonies.title,
        content: testimonies.content,
        videoUrl: testimonies.videoUrl,
        createdAt: testimonies.createdAt,
        authorName: users.name,
        authorAvatarUrl: users.profilePictureUrl,
        isPublic: testimonies.isPublic,
        authorId: testimonies.authorId,
    })
        .from(testimonies)
        .leftJoin(users, eq(testimonies.authorId, users.id))
        .where(eq(testimonies.isPublic, true))
        .orderBy(desc(testimonies.createdAt));
} catch (error) {
    console.error("Failed to fetch testimonies", error);
    return [];
}
  });

export const getPublicTestimonies = getPublicTestimoniesFn;
export const getAllTestimoniesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    try {
    return await db.select({
        id: testimonies.id,
        title: testimonies.title,
        content: testimonies.content,
        videoUrl: testimonies.videoUrl,
        createdAt: testimonies.createdAt,
        authorName: users.name,
        authorAvatarUrl: users.profilePictureUrl,
        isPublic: testimonies.isPublic,
        authorId: testimonies.authorId,
    })
        .from(testimonies)
        .leftJoin(users, eq(testimonies.authorId, users.id))
        .orderBy(desc(testimonies.createdAt));
} catch (error) {
    console.error("Failed to fetch testimonies", error);
    return [];
}
  });

export const getAllTestimonies = getAllTestimoniesFn;
export const getTestimonyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    try {
    const result = await db.select({
        id: testimonies.id,
        title: testimonies.title,
        content: testimonies.content,
        videoUrl: testimonies.videoUrl,
        isPublic: testimonies.isPublic,
        createdAt: testimonies.createdAt,
        authorId: testimonies.authorId,
        authorName: users.name,
        authorAvatarUrl: users.profilePictureUrl,
    })
        .from(testimonies)
        .leftJoin(users, eq(testimonies.authorId, users.id))
        .where(eq(testimonies.id, id))
        .limit(1);

    return result[0] || null;
} catch (error) {
    console.error("Failed to fetch testimony", error);
    return null;
}
  });

export const getTestimony = getTestimonyFn;
export const updateTestimonyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data }) => {
    const { id, prevState, formData } = data;
const session = await getUser();
if (!session) {
    return { message: "Unauthorized" };
}

const rawData = Object.fromEntries(formData);
const result = testimonySchema.safeParse(rawData);
if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
}

const { title, content, isPublic, videoUrl } = result.data;

try {
    const testimony = await db.select().from(testimonies).where(eq(testimonies.id, id)).limit(1);
    if (!testimony.length) return { message: "Testimony not found" };

    if (testimony[0].authorId !== session.userId && session.role !== 'admin') {
        return { message: "Forbidden" };
    }

    await db.update(testimonies).set({
        title,
        content,
        videoUrl: videoUrl || null,
        isPublic: isPublic || false,
    }).where(eq(testimonies.id, id));

    processTestimonyForRecommendations({ data: id });

    
    
    return { success: true };
} catch (error) {
    console.error("Failed to update testimony", error);
    return { message: "Error updating testimony" };
}
  });

export const updateTestimony = updateTestimonyFn;
export const deleteTestimonyFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    const session = await getUser();
if (!session) return { message: "Unauthorized" };

try {
    const testimony = await db.select().from(testimonies).where(eq(testimonies.id, id)).limit(1);
    if (!testimony.length) return { message: "Testimony not found" };

    if (testimony[0].authorId !== session.userId && session.role !== 'admin') {
        return { message: "Forbidden" };
    }

    await db.delete(testimonies).where(eq(testimonies.id, id));
    
    return { success: true };
} catch (error) {
    console.error("Failed to delete testimony", error);
    return { message: "Error deleting testimony" };
}
  });

export const deleteTestimony = deleteTestimonyFn;
