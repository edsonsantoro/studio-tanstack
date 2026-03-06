import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import * as React from 'react'

export const Route = createFileRoute('/$locale/login')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'login' })
  const { locale } = Route.useParams()

  return (
    <div className="flex items-center min-h-[calc(100vh-12rem)] justify-center py-12 px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            {t('no_account')}{" "}
            <Link to="/$locale/signup" params={{ locale }} className="underline text-primary">
              {t('signup_link')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
