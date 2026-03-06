import { createFileRoute, redirect } from '@tanstack/react-router'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileForm } from '@/components/profile/profile-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/profile')({
  loader: async ({ context, params }) => {
    const { user: sessionUser } = context
    const { locale } = params

    if (!sessionUser) {
      throw redirect({
        to: '/$locale/login',
        params: { locale },
      })
    }

    const userProfile = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1)

    if (userProfile.length === 0) {
      throw redirect({
        to: '/$locale/login',
        params: { locale },
      })
    }

    const dbUser = userProfile[0]
    const profile: any = {
      ...dbUser,
      avatarUrl: dbUser.profilePictureUrl || `https://avatar.vercel.sh/${dbUser.id}.png`,
      imageHint: 'avatar portrait'
    }

    return {
      userProfile: profile,
      userId: sessionUser.id,
    }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { userProfile, userId } = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10">
      <ProfileForm
        userProfile={userProfile}
        userId={userId}
        userEmail=""
      />
    </div>
  )
}
