import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin')({
  beforeLoad: async ({ context, params }) => {
    const { user: sessionUser } = context
    const { locale } = params

    if (!sessionUser) {
      throw redirect({
        to: '/$locale/login',
        params: { locale },
      })
    }

    // Double check from DB for role
    const userResult = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1)
    const user = userResult[0]

    if (!user || user.role !== 'admin') {
      throw redirect({
        to: '/$locale',
        params: { locale },
        search: { debug: undefined } as any,
      })
    }
  },
  component: () => <Outlet />,
})
