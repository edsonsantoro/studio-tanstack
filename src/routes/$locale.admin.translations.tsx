import { createFileRoute } from '@tanstack/react-router'
import { getTranslationsForAdmin } from '@/actions/translations'
import { locales } from '@/i18n'
import * as React from 'react'
import { lazy, Suspense } from 'react'

const TranslationsClient = lazy(() => import('@/components/admin/translations-client').then(m => ({ default: m.TranslationsClient })))

export const Route = createFileRoute('/$locale/admin/translations')({
  loader: async () => {
    return await getTranslationsForAdmin()
  },
  component: AdminTranslationsPage,
})

function AdminTranslationsPage() {
  const translations = Route.useLoaderData()
  return (
    <div className='p-4 space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Gerenciamento de Traduções</h1>
      </div>
      <Suspense fallback={<div className='p-8 text-center'>Carregando Editor...</div>}>
        <TranslationsClient 
          initialTranslations={translations} 
          locales={locales} 
          baseLocale='pt' 
        />
      </Suspense>
    </div>
  )
}
