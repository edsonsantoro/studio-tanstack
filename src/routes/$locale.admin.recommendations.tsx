import { createFileRoute } from '@tanstack/react-router'
import { getPendingRecommendationsForAdmin } from '@/actions/recommendations'
import { RecommendationsAdminClient } from '@/components/admin/recommendations-client'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/recommendations')({
  loader: async () => {
    const recommendations = await getPendingRecommendationsForAdmin()
    return { recommendations }
  },
  component: AdminRecommendationsPage,
})

function AdminRecommendationsPage() {
  const { recommendations } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Moderação de Indicações AI</h1>
        <p className="text-muted-foreground">
          Revise os materiais que a AI identificou nos testemunhos antes de enviá-los para aprovação dos usuários.
        </p>
      </div>

      <RecommendationsAdminClient initialRecommendations={recommendations as any} />
    </div>
  )
}
