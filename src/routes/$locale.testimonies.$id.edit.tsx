import { createFileRoute, redirect, notFound } from '@tanstack/react-router'
import { getTestimony, updateTestimony } from '@/actions/testimonies'
import { TestimonyForm } from '@/components/testimonies/testimony-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/testimonies/$id/edit')({
  loader: async ({ params, context }) => {
    const { id } = params
    const { user: session } = context

    if (!session) {
      throw redirect({
        to: '/$locale/login',
        params: { locale: params.locale },
      })
    }

    const testimony = await getTestimony({ data: id })

    if (!testimony) {
      throw notFound()
    }

    // Check permission
    if (testimony.authorId !== session.id && session.role !== 'admin') {
      throw redirect({
        to: '/$locale/testimonies/$id',
        params: { locale: params.locale, id },
      })
    }

    return { testimony, id }
  },
  component: EditTestimonyPage,
})

function EditTestimonyPage() {
  const { testimony } = Route.useLoaderData()

  return (
    <div className="container mx-auto py-10">
      <TestimonyForm
        initialData={testimony as any}
        action={updateTestimony}
        title="Editar Testemunho"
        description="Atualize seu relato para edificar a comunidade."
        successMessage="Testemunho Atualizado!"
        submitLabel="Salvar Alterações"
      />
    </div>
  )
}
