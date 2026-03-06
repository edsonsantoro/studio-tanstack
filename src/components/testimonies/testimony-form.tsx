'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useTranslation } from "react-i18next";

const testimonyFormSchema = z.object({
    title: z.string().min(5, "Título muito curto"),
    content: z.string().min(10, "Conteúdo muito curto"),
    videoUrl: z.string().optional().or(z.literal('')),
    isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof testimonyFormSchema>;

type Testimony = {
    id: string;
    authorId: string;
    title: string;
    content: string;
    videoUrl: string | null;
    createdAt: Date | null;
    isPublic: boolean | null;
}

interface TestimonyFormProps {
    initialData?: Testimony;
    action: (data: any) => Promise<any>;
    title: string;
    description: string;
    successMessage: string;
    submitLabel: string;
}

export function TestimonyForm({
    initialData,
    action,
    title,
    description,
    successMessage,
    submitLabel
}: TestimonyFormProps) {
    const { t } = useTranslation('translation', { keyPrefix: 'testimonies' });
    const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
    const { toast } = useToast();
    const navigate = useNavigate();
    const router = useRouter();
    
    // Safer way to get locale from route params
    const matches = router.state.matches
    const localeMatch = matches.find((m) => m.params && (m.params as any).locale)
    const locale = (localeMatch?.params as any)?.locale || 'pt'
    
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(testimonyFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            content: initialData?.content || '',
            videoUrl: initialData?.videoUrl || '',
            isPublic: initialData?.isPublic || false,
        },
    });

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        if (data.videoUrl) formData.append('videoUrl', data.videoUrl);
        formData.append('isPublic', String(data.isPublic));

        try {
            const result = await action({ data: { id: initialData?.id, prevState: null, formData } });

            if (result?.errors) {
                toast({ variant: 'destructive', title: ct('error'), description: 'Verifique os campos.' });
            } else if (result?.message) {
                toast({ variant: 'destructive', title: ct('error'), description: result.message });
            } else {
                toast({
                    title: successMessage,
                    description: t('toast_success_desc'),
                });
                if (initialData) {
                    navigate({ to: '/$locale/testimonies/$id', params: { locale, id: initialData.id }, search: {} as any });
                } else {
                    navigate({ to: '/$locale/testimonies', params: { locale }, search: {} as any });
                }
                router.invalidate();
            }
        } catch (error: any) {
            console.error("Error submitting testimony:", error);
            toast({
                variant: "destructive",
                title: t('toast_error_submit'),
                description: ct('unexpected_error'),
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg border-primary/10">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-3xl font-bold font-headline text-primary">{title}</CardTitle>
                <CardDescription className="text-lg">
                    {description}
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <CardContent className="pt-6 space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">{t('form_title_label')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('form_title_placeholder')} {...field} className="text-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">{t('form_content_label')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('form_content_placeholder')}
                                            className="min-h-[200px] text-base resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="videoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base">{t('form_video_label')} (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        {t('form_video_desc')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/10">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">{t('form_public_label')}</FormLabel>
                                        <FormDescription>
                                            {t('form_public_desc')}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <div className="flex justify-between items-center px-6 pb-6 pt-2 border-t mt-4 bg-muted/5 rounded-b-lg">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()} disabled={isSubmitting}>
                            {ct('cancel')}
                        </Button>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="px-8 shadow-md">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? ct('saving') : submitLabel}
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}
