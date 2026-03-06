import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { TranslationsClient } from '@/components/admin/translations-client'

export const Route = createFileRoute('/$locale/admin/translations')({
  component: () => <TranslationsClient initialTranslations={{}} locales={['pt', 'en']} baseLocale='pt' />,
})
