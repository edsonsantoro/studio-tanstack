import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { resetPassword } from '@/actions/password-reset'
import { useTranslation } from "react-i18next"
import * as React from 'react'

export const Route = createFileRoute('/$locale/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordForm() {
    const { token } = useSearch({ from: '/$locale/reset-password' })
    const { locale } = Route.useParams()
    const navigate = useNavigate()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation('translation', { keyPrefix: 'password_recovery' })

    const formSchema = z.object({
        password: z.string().min(6, {
            message: t('password_min_length'),
        }),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('passwords_mismatch'),
        path: ["confirmPassword"],
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) return

        setLoading(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        try {
            const result = await resetPassword({ data: { token, password: values.password } })

            if (result.success) {
                setSuccessMessage(t('reset_success'))
                setTimeout(() => {
                    navigate({ to: '/$locale/login', params: { locale } })
                }, 3000)
            } else {
                setErrorMessage(result.message || t('error_unexpected'))
            }
        } catch (error) {
            setErrorMessage(t('error_unexpected'))
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center text-red-500">
                {t('invalid_token_message')}
            </div>
        )
    }

    if (successMessage) {
        return (
            <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 font-headline">{t('success_title')}</h3>
                        <div className="mt-2 text-sm text-green-700">
                            <p>{successMessage}</p>
                            <p className="mt-2 text-xs text-gray-500">{t('redirecting')}</p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <Link
                                    to="/$locale/login"
                                    params={{ locale }}
                                    className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                >
                                    {t('return_to_login')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('new_password_label')}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('confirm_password_label')}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {errorMessage && (
                    <div className="text-sm text-red-500 text-center">{errorMessage}</div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('resetting') : t('reset_button')}
                </Button>
            </form>
        </Form>
    )
}

function ResetPasswordPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'password_recovery' })

    return (
        <div className="flex items-center min-h-[calc(100vh-12rem)] justify-center py-12 px-4">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center font-headline">{t('reset_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-center">{t('loading')}</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
