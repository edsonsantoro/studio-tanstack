import { createFileRoute, redirect } from '@tanstack/react-router'
import { CreateEventForm } from '@/components/events/create-event-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/events/create')({
  loader: async ({ params, context }) => {
    const { user: session } = context

    if (!session) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      })
    }

    return { session }
  },
  component: CreateEventPage,
})

function CreateEventPage() {
  const { session } = Route.useLoaderData()

  return <CreateEventForm user={session} />
}
