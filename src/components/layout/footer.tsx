import { useTranslation } from 'react-i18next'
import { Link, useRouter } from '@tanstack/react-router'

export function AppFooter() {
  const { t } = useTranslation()
  const router = useRouter()
  // Safer way to get locale from route params
  const matches = router.state.matches
  const localeMatch = matches.find((m) => m.params && (m.params as any).locale)
  const locale = (localeMatch?.params as any)?.locale || 'pt'
  const year = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-4 py-8 text-center text-sm md:flex-row md:justify-between">
        <p className="text-muted-foreground">
          {t('footer.copyright', { year })}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/$locale/terms-of-service"
            params={{ locale }}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('footer.terms')}
          </Link>
          <Link
            to="/$locale/roadmap"
            params={{ locale }}
            className="text-muted-foreground hover:text-foreground"
          >
            Roadmap
          </Link>
          <Link
            to="/$locale/privacy-policy"
            params={{ locale }}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
