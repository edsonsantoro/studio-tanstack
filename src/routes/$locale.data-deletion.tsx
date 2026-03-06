import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { useTranslation } from "react-i18next"
import * as React from 'react'

export const Route = createFileRoute('/$locale/data-deletion')({
  component: DataDeletionPage,
})

function DataDeletionPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'data_deletion' })

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 flex justify-center">
            <Card className="max-w-3xl w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">{t('title')}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        {t('intro')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                        <div className="border-l-4 border-primary pl-4 py-1">
                            <h3 className="text-xl font-semibold mb-2">{t('step1_title')}</h3>
                            <p className="text-muted-foreground">{t('step1_content')}</p>
                        </div>

                        <div className="border-l-4 border-primary pl-4 py-1">
                            <h3 className="text-xl font-semibold mb-2">{t('step2_title')}</h3>
                            <p className="text-muted-foreground">{t('step2_content')}</p>
                        </div>

                        <div className="border-l-4 border-primary pl-4 py-1">
                            <h3 className="text-xl font-semibold mb-2">{t('step3_title')}</h3>
                            <p className="text-muted-foreground">{t('step3_content')}</p>
                        </div>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-lg border border-border mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="font-medium mb-1">{t('contact_support')}</p>
                            <p className="text-sm text-muted-foreground">support@hirtlerconnect.com</p>
                        </div>
                        <Button asChild variant="default">
                            <a href="mailto:support@hirtlerconnect.com" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{t('email_support')}</span>
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
