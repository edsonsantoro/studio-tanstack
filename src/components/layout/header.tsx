import { Link, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Mountain } from 'lucide-react'
import { HeaderUserMenu } from './header-user-menu'
import { HeaderMobileMenu } from './header-mobile-menu'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './language-switcher'

interface AppHeaderProps {
  user?: any
  pendingCount?: number
}

export function AppHeader({ user, pendingCount = 0 }: AppHeaderProps) {
  const { t } = useTranslation()
  const router = useRouter()
  // Safer way to get locale from route params
  const matches = router.state.matches
  const localeMatch = matches.find((m) => m.params && (m.params as any).locale)
  const locale = (localeMatch?.params as any)?.locale || 'pt'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/$locale" params={{ locale }} search={{ debug: undefined } as any} className="mr-6 flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline text-lg">
              Comunidade Sem Limites
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link to="/$locale/events" params={{ locale }} search={{}}>{t('header.events')}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/$locale/testimonies" params={{ locale }} search={{}}>{t('header.testimonies')}</Link>
            </Button>
            {user && (
              <Button variant="ghost" asChild>
                <Link to="/$locale/dashboard" params={{ locale }} search={{}}>{t('header.community')}</Link>
              </Button>
            )}
          </nav>
        </div>

        <HeaderMobileMenu user={user} pendingCount={pendingCount} />

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <HeaderUserMenu user={user} pendingCount={pendingCount} />
        </div>
      </div>
    </header>
  )
}
