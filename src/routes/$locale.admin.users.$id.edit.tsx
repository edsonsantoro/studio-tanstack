import { createFileRoute, notFound } from '@tanstack/react-router'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { EditUserForm } from '@/components/admin/edit-user-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/users/$id/edit')({
  loader: async ({ params }) => {
    const { id: userId } = params
    const userResult = await db.select().from(users).where(eq(users.id, userId))
    const userProfile = userResult[0]

    if (!userProfile) {
      throw notFound()
    }

    return { userProfile, userId }
  },
  component: EditMemberPage,
})

function EditMemberPage() {
  const { userProfile, userId } = Route.useLoaderData()

  return <EditUserForm user={userProfile} userId={userId} />
}
