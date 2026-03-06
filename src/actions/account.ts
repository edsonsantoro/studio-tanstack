import { getUser } from '@/lib/auth'
import { db } from '@/db'
import { users, verificationRequests, testimonies, events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from '@tanstack/react-router'
import { deleteSession } from '@/lib/auth'
import { createServerFn } from '@tanstack/react-start'

export const deleteSelfFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const session = await getUser()

    if (!session) {
      throw new Error('Unauthorized')
    }

    const userId = session.userId

    try {
      // 1. Delete verification requests
      await db
        .delete(verificationRequests)
        .where(eq(verificationRequests.requesterId, userId))
      await db
        .delete(verificationRequests)
        .where(eq(verificationRequests.verifierId, userId))

      // 2. Delete testimonies
      await db.delete(testimonies).where(eq(testimonies.authorId, userId))

      // 3. Delete events
      await db.delete(events).where(eq(events.organizerId, userId))

      // 4. Delete user
      await db.delete(users).where(eq(users.id, userId))

      // 5. Delete session
      await deleteSession()
    } catch (error) {
      console.error('Failed to delete user account:', error)
      throw new Error('Failed to delete account')
    }

    throw redirect({ to: '/' })
  },
)

export const deleteSelf = deleteSelfFn
