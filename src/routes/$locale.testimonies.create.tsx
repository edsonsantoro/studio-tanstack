import { createFileRoute } from '@tanstack/react-router'
import { createTestimony } from '@/actions/testimonies'
import { TestimonyForm } from '@/components/testimonies/testimony-form'
import * as React from 'react'

export const Route = createFileRoute('/$locale/testimonies/create')({
  component: CreateTestimonyPage,
})

function CreateTestimonyPage() {
  return (
    <div className="container mx-auto py-10">
      <TestimonyForm
        action={createTestimony}
        title="Compartilhe seu Testemunho"
        description="Conte para a comunidade as maravilhas que Deus tem feito em sua vida."
        successMessage="Testemunho Enviado!"
        submitLabel="Publicar Testemunho"
      />
    </div>
  )
}
