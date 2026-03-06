import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
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
import { requestPasswordReset } from '@/actions/password-reset'
import { useTranslation } from "react-i18next"
import * as React from 'react'

export const Route = createFileRoute('/$locale/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'password_recovery' })
    const { locale } = Route.useParams()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const formSchema = z.object({
        email: z.string().email({
            message: "Por favor, insira um email válido."
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        try {
            const result = await requestPasswordReset({ data: values.email })
            if (result.success) {
                setSuccessMessage(result.message || 'Success')
            } else {
                setErrorMessage(result.message || t('error_unexpected'))
            }
        } catch (error) {
            setErrorMessage(t('error_unexpected'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center min-h-[calc(100vh-12rem)] justify-center py-12 px-4">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center font-headline">{t('forgot_title')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('forgot_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {successMessage ? (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">{t('success_title')}</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{successMessage}</p>
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
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('email_label')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('email_placeholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {errorMessage && (
                                    <div className="text-sm text-red-500 text-center">{errorMessage}</div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? t('sending') : t('send_link')}
                                </Button>

                                <div className="text-center text-sm">
                                    <Link 
                                        to="/$locale/login" 
                                        params={{ locale }}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {t('back_to_login')}
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
