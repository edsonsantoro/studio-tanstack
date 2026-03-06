import { createFileRoute, redirect, notFound } from '@tanstack/react-router'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { EditEventForm } from '@/components/events/edit-event-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/events/$id/edit')({
  loader: async ({ params, context }) => {
    const { id } = params
    const { user: session } = context

    if (!session) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      })
    }

    const eventResult = await db.select().from(events).where(eq(events.id, id))
    const event = eventResult[0]

    if (!event) {
      throw notFound()
    }

    // Server-side check: Organization
    if (event.organizerId !== session.id && session.role !== 'admin') {
      throw redirect({
        to: '/$locale/events/$id',
        params: { locale: params.locale, id },
      })
    }

    return { event, session }
  },
  component: EditEventPage,
})

function EditEventPage() {
  const { event, session } = Route.useLoaderData()

  return <EditEventForm event={event} user={session} />
}
