import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/layout/header'
import { AppFooter } from '@/components/layout/footer'
import * as React from 'react'
import i18n from '@/lib/i18n'
import { getCurrentUserFn } from '@/actions/auth'

export const Route = createFileRoute('/$locale')({
  beforeLoad: async ({ params }) => {
    const { locale } = params
    
    // Validar locale
    const validLocales = ['pt', 'en', 'es', 'de']
    if (!validLocales.includes(locale)) {
      throw redirect({
        to: '/$locale',
        params: { locale: 'pt' },
        search: { debug: undefined } as any,
      })
    }

    // Mudar o idioma no i18next
    if (i18n.language !== locale) {
      await i18n.changeLanguage(locale)
    }

    // Carregar usuário no servidor
    const user = await getCurrentUserFn()

    return {
      user,
      locale,
    }
  },
  component: LocaleLayout,
})

function LocaleLayout() {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const pendingCount = 0 // Implementaremos a contagem real na Fase 4

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={user} pendingCount={pendingCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
