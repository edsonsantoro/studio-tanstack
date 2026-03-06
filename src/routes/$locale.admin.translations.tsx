import { createFileRoute } from '@tanstack/react-router'
import { getTranslationsForAdmin } from '@/actions/translations'
import { lazy, Suspense } from 'react';
const TranslationsClient = lazy(() => import('@/components/admin/translations-client').then(m => ({ default: m.TranslationsClient })));
// /components/admin/translations-client'
import { locales } from '@/i18n'
import i18n from '@/lib/i18n'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/$locale/admin/translations')({
  loader: async () => {
    const translations = await getTranslationsForAdmin()
    return { translations }
  },
  component: AdminTranslationsPage,
})

function AdminTranslationsPage() {
  const { translations } = Route.useLoaderData()
  const { t } = useTranslation('translation', { keyPrefix: 'admin' })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">{t('translations_page_title')}</h1>
        <p className="text-muted-foreground">
          {t('translations_page_desc')}
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}><TranslationsClient
        initialTranslations={translations}
        locales={locales}
        baseLocale="pt"
       /> </Suspense>
    </div>
  )
}
