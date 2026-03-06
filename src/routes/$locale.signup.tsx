import { createFileRoute, Link } from '@tanstack/react-router'
import { SignupForm } from "@/components/auth/signup-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import * as React from 'react'

export const Route = createFileRoute('/$locale/signup')({
  component: SignupPage,
})

function SignupPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'signup' })
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
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            {t('already_have_account')}{" "}
            <Link to="/$locale/login" params={{ locale }} className="underline text-primary">
              {t('login_link') || 'Login'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
