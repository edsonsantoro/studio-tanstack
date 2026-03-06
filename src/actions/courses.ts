import { db } from '@/db'
import { hotmartCourseLinks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const saveCourseLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        hotmartId: z.string(),
        manualUrl: z.string().url(),
        manualImageUrl: z.string().url().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { hotmartId, manualUrl, manualImageUrl } = data
    try {
      const existing = await db.query.hotmartCourseLinks.findFirst({
        where: eq(hotmartCourseLinks.hotmartId, hotmartId),
      })

      if (existing) {
        await db
          .update(hotmartCourseLinks)
          .set({
            manualUrl,
            manualImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(hotmartCourseLinks.hotmartId, hotmartId))
      } else {
        await db.insert(hotmartCourseLinks).values({
          hotmartId,
          manualUrl,
          manualImageUrl,
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving course link:', error)
      throw new Error(String(error))
    }
  })

export const deleteCourseLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: hotmartId }) => {
    try {
      await db
        .delete(hotmartCourseLinks)
        .where(eq(hotmartCourseLinks.hotmartId, hotmartId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting course link:', error)
      throw new Error(String(error))
    }
  })

// Alias para compatibilidade
export const saveCourseLink = saveCourseLinkFn
export const deleteCourseLink = deleteCourseLinkFn
