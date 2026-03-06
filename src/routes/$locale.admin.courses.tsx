import { createFileRoute } from '@tanstack/react-router'
import { getHotmartProducts } from '@/lib/hotmart'
import { CourseManagerClient } from '@/components/admin/course-manager-client'
import * as React from 'react'

export const Route = createFileRoute('/$locale/admin/courses')({
  loader: async () => {
    const allProducts = await getHotmartProducts(true, 'all')
    return { allProducts }
  },
  component: AdminCoursesPage,
})

function AdminCoursesPage() {
  const { allProducts } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Cursos Hotmart</h1>
          <p className="text-muted-foreground">
            Links automáticos já funcionam para todos os cursos. Configure links customizados (ex: afiliados) e imagens de capa personalizadas opcionalmente.
          </p>
        </div>
      </div>

      <CourseManagerClient initialProducts={allProducts} />
    </div>
  )
}
