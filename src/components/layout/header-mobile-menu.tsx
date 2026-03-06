import { Link, useNavigate, useLocation, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Menu, Mountain, Languages, Globe } from 'lucide-react'
import { logout } from '@/actions/auth'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HeaderMobileMenuProps {
  user: any
  pendingCount: number
}

export function HeaderMobileMenu({ user, pendingCount }: HeaderMobileMenuProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const matches = router.state.matches
  const localeMatch = matches.find((m) => m.params && (m.params as any).locale)
  const locale = (localeMatch?.params as any)?.locale || 'pt'
  const isAdmin = user?.role === 'admin' || user?.email === 'edsonsantoro@gmail.com'

  const onSelectChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale)
    router.navigate({
      replace: true,
      to: '.',
      params: (prev: any) => ({ ...prev, locale: newLocale }),
      search: (prev: any) => prev,
    })
    setOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    router.invalidate()
  }

  const locales = ['pt', 'en', 'es', 'de']

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetTitle className="sr-only">Navegação Principal</SheetTitle>
        <SheetDescription className="sr-only">
          Menu com links de navegação para o site.
        </SheetDescription>
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <Link to="/$locale" params={{ locale }} search={{ debug: undefined } as any} className="flex items-center" onClick={() => setOpen(false)}>
              <Mountain className="h-6 w-6 text-primary" />
              <span className="font-bold ml-2 font-headline text-lg">
                Comunidade Sem Limites
              </span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid gap-4 text-lg font-medium p-4">
              {user && (
                <Link
                  to="/$locale/dashboard"
                  params={{ locale }}
                  search={{}}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {t('header.community')}
                </Link>
              )}

              <Link
                to="/$locale/events"
                params={{ locale }}
                search={{}}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {t('header.events')}
              </Link>
              <Link
                to="/$locale/testimonies"
                params={{ locale }}
                search={{}}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {t('header.testimonies')}
              </Link>
              {user ? (
                <>
                  <Link
                    to="/$locale/profile"
                    params={{ locale }}
                    search={{}}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {t('header.menu_profile')}
                  </Link>
                  <Link
                    to="/$locale/roadmap"
                    params={{ locale }}
                    search={{}}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    Roadmap
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="px-2.5 text-sm font-semibold text-muted-foreground mt-4">
                        Admin
                      </div>
                      <Link
                        to="/$locale/admin"
                        params={{ locale }}
                        search={{}}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {t('header.admin_panel')}
                      </Link>
                      <Link
                        to="/$locale/admin/moderation"
                        params={{ locale }}
                        search={{}}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {t('admin.moderation_page_title')}
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/$locale/login"
                    params={{ locale }}
                    search={{}}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {t('home.cta_login')}
                  </Link>
                  <Link
                    to="/$locale/signup"
                    params={{ locale }}
                    search={{}}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {t('home.cta_join')}
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Select value={locale} onValueChange={onSelectChange}>
                <SelectContent>
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
              </Select>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground text-lg text-left w-full"
              >
                {t('header.menu_logout')}
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
