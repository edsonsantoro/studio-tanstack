import { db } from '@/db'
import { feedbacks, feedbackSettings } from '@/db/schema'
import { getUser } from '@/lib/auth'
import { sendEmail } from '@/lib/nodemailer'
import { desc, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        content: z.string(),
        pageUrl: z.string(),
        userAgent: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    try {
      const [feedback] = await db
        .insert(feedbacks)
        .values({
          content: data.content,
          pageUrl: data.pageUrl,
          userAgent: data.userAgent,
          userId: user.userId,
        })
        .returning()

      const settings = await db.select().from(feedbackSettings).limit(1)
      const config = settings[0] || {
        notifyEmail: 'edsonsantoro@gmail.com',
        sendEmailNotifications: true,
      }

      if (config.sendEmailNotifications && config.notifyEmail) {
        const html = `
                <h2>New Feedback Received</h2>
                <p><strong>User:</strong> ${user.userId}</p>
                <p><strong>Page:</strong> ${data.pageUrl}</p>
                <p><strong>Content:</strong></p>
                <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
                    ${data.content.replace(/\n/g, '<br>')}
                </blockquote>
                <br>
                <p><small>User Agent: ${data.userAgent}</small></p>
            `
        await sendEmail(config.notifyEmail, 'New Studio Feedback', html)
      }

      return { success: true, feedback }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw new Error('Failed to submit feedback')
    }
  })

export const getFeedbacksFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    return await db.select().from(feedbacks).orderBy(desc(feedbacks.createdAt))
  },
)

export const updateFeedbackSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        notifyEmail: z.string().email(),
        sendEmailNotifications: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    try {
      const existing = await db.select().from(feedbackSettings).limit(1)

      if (existing.length > 0) {
        await db
          .update(feedbackSettings)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(feedbackSettings.id, existing[0].id))
      } else {
        await db.insert(feedbackSettings).values(data)
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating settings:', error)
      throw new Error('Update failed')
    }
  })

export const getFeedbackSettingsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const settings = await db.select().from(feedbackSettings).limit(1)
    return settings[0] || null
  },
)

// Alias
export const submitFeedback = submitFeedbackFn
export const getFeedbacks = getFeedbacksFn
export const updateFeedbackSettings = updateFeedbackSettingsFn
export const getFeedbackSettings = getFeedbackSettingsFn
