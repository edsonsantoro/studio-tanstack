import { createFileRoute } from '@tanstack/react-router'
import { getFeedbacks, getFeedbackSettings } from '@/actions/feedback'
import { FeedbackClient } from '@/components/admin/feedback-client'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/feedback')({
  loader: async () => {
    const feedbacks = await getFeedbacks()
    const settings = await getFeedbackSettings()
    return { feedbacks, settings }
  },
  component: AdminFeedbackPage,
})

function AdminFeedbackPage() {
  const { feedbacks, settings } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Gerenciamento de Feedback</h1>
      <FeedbackClient initialFeedbacks={feedbacks} initialSettings={settings} />
    </div>
  )
}
