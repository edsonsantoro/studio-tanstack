import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { LogOut, ChevronDown, Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/actions/auth'
import { useTranslation } from 'react-i18next'

interface HeaderUserMenuProps {
  user: any
  pendingCount: number
}

export function HeaderUserMenu({ user, pendingCount }: HeaderUserMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const router = useRouter()
  // Safer way to get locale from route params
  const matches = router.state.matches
  const localeMatch = matches.find((m) => m.params && (m.params as any).locale)
  const locale = (localeMatch?.params as any)?.locale || 'pt'
  const isAdmin = user?.role === 'admin' || user?.email === 'edsonsantoro@gmail.com'

  const handleLogout = async () => {
    try {
      await logout()
      router.invalidate()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return (
      <nav className="hidden md:flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/$locale/login" params={{ locale }} search={{}}>{t('home.cta_login')}</Link>
        </Button>
        <Button asChild>
          <Link to="/$locale/signup" params={{ locale }} search={{}}>{t('home.cta_join')}</Link>
        </Button>
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-2">
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              {t('admin.quick_actions_title')}{' '}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => navigate({ to: '/$locale/admin', params: { locale }, search: {} as any })}>
              {t('header.admin_panel')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => navigate({ to: '/$locale/admin/moderation', params: { locale }, search: {} as any })}
            >
              {t('admin.moderation_page_title')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: '/$locale/admin/users', params: { locale }, search: {} as any })}>
              {t('admin.users_page_title')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => navigate({ to: '/$locale/admin/add-member', params: { locale }, search: {} as any })}
            >
              {t('admin.add_member_page_title')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => navigate({ to: '/$locale/admin/translations', params: { locale }, search: {} as any })}
            >
              <Languages className="mr-2 h-4 w-4" />
              {t('admin.action_manage_translations')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            {user.name} <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/$locale/profile" params={{ locale }} search={{}}>{t('header.menu_profile')}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/$locale/roadmap" params={{ locale }} search={{}}>Roadmap</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {t('header.menu_logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
