import { createFileRoute } from '@tanstack/react-router'
import { getPublicUsers } from '@/actions/users'
import { getPublicEvents } from '@/actions/events'
import { getVerificationRequests } from '@/actions/verification'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import * as React from 'react'

export const Route = createFileRoute('/$locale/dashboard')({
  loader: async ({ context }) => {
    const { user: sessionUser } = context
    
    // Fetch full user record if session exists
    let dbUser = null
    if (sessionUser?.id) {
      const usersRecord = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1)
      if (usersRecord.length > 0) {
        dbUser = usersRecord[0]

        // If user has no invite code, generate one now
        if (!dbUser.inviteCode) {
          const newCode = Math.random().toString(36).substring(2, 10)
          await db.update(users).set({ inviteCode: newCode }).where(eq(users.id, dbUser.id))
          dbUser.inviteCode = newCode
        }
      }
    }

    // Fetch data in parallel
    const [publicUsers, events, requests] = await Promise.all([
      getPublicUsers(),
      getPublicEvents(),
      getVerificationRequests(),
    ])

    // If current user is not approved, they won't be in publicUsers
    // So we need to add them manually to the list
    let allUsers = publicUsers
    if (dbUser && !dbUser.isApproved) {
      // Check if user already exists in the list (shouldn't happen, but just in case)
      const userExists = publicUsers.some(u => u.id === dbUser.id)
      if (!userExists) {
        // Add current user to the list so they can see themselves
        allUsers = [...publicUsers, {
          id: dbUser.id,
          name: dbUser.name,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          city: dbUser.city,
          country: dbUser.country,
          profilePictureUrl: dbUser.profilePictureUrl,
          coords: dbUser.coords,
          bio: dbUser.bio,
          tags: dbUser.tags,
          isTraveler: dbUser.isTraveler,
          languages: dbUser.languages,
          whatsAppLink: dbUser.whatsAppLink,
          instagramLink: dbUser.instagramLink,
          blogLink: dbUser.blogLink,
          websiteLink: dbUser.websiteLink,
          visibilitySettings: dbUser.visibilitySettings,
        }] as any
      }
    }

    return {
      users: allUsers,
      events,
      currentUser: dbUser,
      requests,
    }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { users, events, currentUser, requests } = Route.useLoaderData()
  
  return <DashboardClient users={users} events={events} currentUser={currentUser} requests={requests} />
}
