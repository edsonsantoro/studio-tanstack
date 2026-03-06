import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ModerationList } from '@/components/admin/moderation-client'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/moderation')({
  loader: async () => {
    const pendingUsers = await db.select().from(users).where(eq(users.status, 'pending'))
    return { pendingUsers }
  },
  component: AdminModerationPage,
})

function AdminModerationPage() {
  const { pendingUsers } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-8">
      <ModerationList users={pendingUsers} />
    </div>
  )
}
