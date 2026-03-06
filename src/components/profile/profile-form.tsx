'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { CountrySelector } from '@/components/ui/country-selector';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { allTags, UserProfile, tagToKey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
    Loader2,
    Copy,
    Upload,
} from 'lucide-react';
import { LocationSearch } from '@/components/location-search';
import { cn } from '@/lib/utils';
import { updateProfile } from '@/actions/profile';
import { useRouter, useNavigate } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locales } from '@/i18n';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSelf } from '@/actions/account';
import { updateAvatarFromSocial, unlinkSocialAccount } from '@/actions/profile';
import { useTranslation } from "react-i18next";

interface ProfileFormProps {
    userProfile: UserProfile;
    userEmail: string;
    userId: string;
}

const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    bio: z.string().max(500).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    isTraveler: z.boolean().default(false).optional(),
    tags: z.array(z.string()).optional(),
    whatsAppNumber: z.string().optional(),
    instagramUsername: z.string().optional(),
    facebookLink: z.string().optional(),
    twitterLink: z.string().optional(),
    telegramUsername: z.string().optional(),
    blogLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    websiteLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
    profilePictureUrl: z.string().optional(),
    visibility: z.enum(['public', 'restricted', 'hidden']).default('public'),
    languages: z.array(z.string()).optional(),
    visitedCountries: z.array(z.string()).optional(),
    languagePreference: z.string().optional(),
    visibilitySettings: z.object({
        showProfilePicture: z.boolean().default(true),
        showBio: z.boolean().default(true),
        showLanguages: z.boolean().default(true),
        showWhatsAppLink: z.boolean().default(true),
        showInstagramLink: z.boolean().default(true),
        showFacebookLink: z.boolean().default(true),
        showTwitterLink: z.boolean().default(true),
        showTelegramUsername: z.boolean().default(true),
        showBlogLink: z.boolean().default(true),
        showWebsiteLink: z.boolean().default(true),
    }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ userProfile, userEmail, userId }: ProfileFormProps) {
    const { t: t } = useTranslation('translation', { keyPrefix: 'profile' });
    const { t: tCommon } = useTranslation('translation', { keyPrefix: 'common' });
    const { t: tTags } = useTranslation('translation', { keyPrefix: 'tags' });
    const { toast } = useToast();
    const router = useRouter();
    const navigate = useNavigate();
    const locale = useTranslation().i18n.language;
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isUnlinking, setIsUnlinking] = React.useState<string | null>(null);

    const handleUnlink = async (provider: 'google' | 'facebook' | 'twitter') => {
        setIsUnlinking(provider);
        try {
            const result = await unlinkSocialAccount({ data: provider });
            if (result.success) {
                toast({
                    title: t('connected_accounts.toast_unlink_success_title'),
                    description: t('connected_accounts.toast_unlink_success_desc'),
                });
                router.invalidate();
            } else {
                if (result.message === 'password_required') {
                    toast({
                        variant: 'destructive',
                        title: tCommon('error'),
                        description: t('connected_accounts.toast_unlink_error_password'),
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: tCommon('error'),
                        description: t('connected_accounts.toast_unlink_error'),
                    });
                }
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: tCommon('error'),
                description: tCommon('unexpected_error'),
            });
        } finally {
            setIsUnlinking(null);
        }
    };

    // Robust username extraction functions matching backend logic
    const sanitizeUsername = (input: string, patterns: RegExp[]): string => {
        if (!input) return '';
        let cleaned = input.trim();

        // Try to extract from URL patterns
        for (const pattern of patterns) {
            const match = cleaned.match(pattern);
            if (match && match[1]) {
                cleaned = match[1];
                break;
            }
        }

        // Remove @ prefix if present
        cleaned = cleaned.replace(/^@+/, '');

        // Remove trailing slashes
        cleaned = cleaned.replace(/\/+$/, '');

        // Remove any remaining URL protocols
        cleaned = cleaned.replace(/^https?:\/\//, '');

        return cleaned;
    };

    const getWhatsAppNumber = (url: string) => {
        if (!url) return '';
        return url.replace('https://wa.me/', '').replace(/\D/g, '');
    };

    const getInstagramUsername = (url: string) => {
        return sanitizeUsername(url, [
            /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?]+)/i,
            /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([^/?]+)/i,
        ]);
    };

    const getFacebookUsername = (url: string) => {
        return sanitizeUsername(url, [
            /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?]+)/i,
            /(?:https?:\/\/)?(?:www\.)?fb\.com\/([^/?]+)/i,
            /(?:https?:\/\/)?(?:www\.)?fb\.me\/([^/?]+)/i,
        ]);
    };

    const getTwitterUsername = (url: string) => {
        return sanitizeUsername(url, [
            /(?:https?:\/\/)?(?:www\.)?twitter\.com\/([^/?]+)/i,
            /(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?]+)/i,
        ]);
    };

    const getTelegramUsername = (username: string) => {
        return sanitizeUsername(username, [
            /(?:https?:\/\/)?(?:www\.)?t\.me\/([^/?]+)/i,
            /(?:https?:\/\/)?(?:www\.)?telegram\.me\/([^/?]+)/i,
        ]);
    };



    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: userProfile?.name || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || '',
            bio: userProfile?.bio || '',
            city: userProfile?.city || '',
            country: userProfile?.country || '',
            latitude: (userProfile?.coords as any)?.lat || userProfile?.latitude,
            longitude: (userProfile?.coords as any)?.lng || userProfile?.longitude,
            isTraveler: userProfile?.isTraveler || false,
            tags: userProfile?.tags || [],
            whatsAppNumber: getWhatsAppNumber(userProfile?.whatsAppLink || ''),
            instagramUsername: getInstagramUsername(userProfile?.instagramLink || ''),
            facebookLink: getFacebookUsername(userProfile?.facebookLink || ''),
            twitterLink: getTwitterUsername(userProfile?.twitterLink || ''),
            telegramUsername: getTelegramUsername(userProfile?.telegramUsername || ''),
            blogLink: userProfile?.blogLink || '',
            websiteLink: userProfile?.websiteLink || '',

            profilePictureUrl: userProfile?.profilePictureUrl || '',
            visibility: userProfile?.isLocationPublic ? 'public' : 'hidden',
            languages: userProfile?.languages || [],
            visitedCountries: userProfile?.visitedCountries || [],
            languagePreference: userProfile?.languagePreference || '',
            visibilitySettings: userProfile?.visibilitySettings || {
                showProfilePicture: true,
                showBio: true,
                showLanguages: true,
                showWhatsAppLink: true,
                showInstagramLink: true,
                showFacebookLink: true,
                showTwitterLink: true,
                showTelegramUsername: true,
                showBlogLink: true,
                showWebsiteLink: true,
            }
        },
    });

    const watchedAvatarUrl = form.watch('profilePictureUrl');

    const isAdmin = userProfile?.role === 'admin' || userEmail === 'edsonsantoro@gmail.com';

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: t('toast_avatar_invalid_format_title'), description: t('toast_avatar_invalid_format_desc') });
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: t('toast_avatar_too_large_title'), description: t('toast_avatar_too_large_desc') });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIMENSION = 256;

                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round(height * (MAX_DIMENSION / width));
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round(width * (MAX_DIMENSION / height));
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                form.setValue('profilePictureUrl', dataUrl, { shouldValidate: true });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    async function onSubmit(data: ProfileFormValues) {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'visibilitySettings' || key === 'tags' || key === 'languages' || key === 'visitedCountries') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        try {
            const result = await updateProfile({ data: { prevState: null, formData } });
            if (result.success) {
                toast({
                    title: t('toast_update_success_title'),
                    description: t('toast_update_success_desc'),
                });

                if (data.languagePreference && data.languagePreference !== locale) {
                    navigate({ to: '/$locale/profile', params: { locale: data.languagePreference } });
                } else {
                    router.invalidate();
                }
            } else {
                toast({ variant: 'destructive', title: tCommon('error'), description: (result as any).message || t('toast_update_error') });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: tCommon('error'), description: tCommon('unexpected_error') });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleLocationSelect = (location: { name: string; country: string; lat: number; lng: number; }) => {
        form.setValue("city", location.name);
        form.setValue("country", location.country);
        form.setValue("latitude", location.lat);
        form.setValue("longitude", location.lng);
        form.clearErrors("city");
    };

    const handleCopyInviteLink = () => {
        const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?invite=${userProfile.inviteCode}`;
        navigator.clipboard.writeText(inviteLink);
        toast({
            title: t('invite_box_toast_title'),
            description: t('invite_box_toast_desc'),
        });
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteSelf();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: tCommon('error'),
                description: tCommon('unexpected_error'),
            });
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader className="p-4 sm:p-6 text-center sm:text-left border-b bg-muted/5">
                            <CardTitle className="font-headline text-2xl text-primary">{t('page_title')}</CardTitle>
                            <CardDescription>
                                {t('page_desc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
                                        <img
                                            src={watchedAvatarUrl || userProfile?.profilePictureUrl || `https://avatar.vercel.sh/${userId}.png`}
                                            alt="Avatar"
                                            className="h-full w-full object-cover bg-muted"
                                            onError={(e) => { e.currentTarget.src = `https://avatar.vercel.sh/${userId}.png` }}
                                        />
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <Upload className="h-5 w-5" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                
                                <div className="flex-grow w-full space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">{tCommon('name')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={tCommon('name')} {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-dashed">
                                        {watchedAvatarUrl ? 'Nova foto selecionada! Não esqueça de salvar.' : t('avatar_upload_desc')}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {userProfile?.googleProfilePictureUrl && (
                                            <Button type="button" variant="outline" size="sm" onClick={() => updateAvatarFromSocial({ data: 'google' })}>Google Avatar</Button>
                                        )}
                                        {userProfile?.facebookProfilePictureUrl && (
                                            <Button type="button" variant="outline" size="sm" onClick={() => updateAvatarFromSocial({ data: 'facebook' })}>Facebook Avatar</Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="isTraveler"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 p-5 shadow-sm bg-primary/5 border-primary/10">
                                        <div className="space-y-0.5 pr-4">
                                            <FormLabel className="text-lg font-bold text-primary">{t('is_traveler_label')}</FormLabel>
                                            <FormDescription className="text-sm">
                                                {t('is_traveler_desc')}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="languagePreference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{t('language_preference_label')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder={t('language_preference_placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {locales.map(locale => (
                                                        <SelectItem key={locale} value={locale}>{locale.toUpperCase()}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{tCommon('location')}</FormLabel>
                                            <FormControl>
                                                <LocationSearch
                                                    onLocationSelect={handleLocationSelect}
                                                    initialValue={form.getValues('city') ? `${form.getValues('city')}, ${form.getValues('country')}` : ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('bio_label')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('bio_placeholder')}
                                                className="resize-none min-h-[120px] text-base"
                                                maxLength={500}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-right text-xs">
                                            {field.value?.length || 0}/500 caracteres
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-lg">{tCommon('tags')}</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-xl border p-5 bg-muted/5">
                                            {allTags.map((tag) => {
                                                const isCyberchurchTag = tag === 'Cyberchurch';
                                                const isDisabled = isCyberchurchTag && !isAdmin;
                                                return (
                                                    <FormField
                                                        key={tag}
                                                        control={form.control}
                                                        name="tags"
                                                        render={({ field }) => (
                                                            <FormItem
                                                                key={tag}
                                                                className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        disabled={isDisabled}
                                                                        checked={field.value?.includes(tag)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), tag])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== tag
                                                                                    )
                                                                                );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className={cn("font-normal text-sm cursor-pointer", isDisabled && "cursor-not-allowed opacity-60")}>
                                                                    {tTags(`${tagToKey[tag] || tag}`, tag)}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                        }
                                                    />
                                                )
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="visitedCountries"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">Países Visitados (Missões ou Eventos Cristãos)</FormLabel>
                                        <FormControl>
                                            <CountrySelector
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Selecione os países por onde já passou..."
                                            />
                                        </FormControl>
                                        <FormDescription>Compartilhe os lugares onde você já serviu ou participou de eventos.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-6 pt-4">
                                <h3 className="text-xl font-bold border-b-2 border-primary/10 pb-2 text-primary">{t('links_title')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="whatsAppNumber" render={({ field }) => (
                                        <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="5511999999999" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="instagramUsername" render={({ field }) => (
                                        <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="usuario" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="facebookLink" render={({ field }) => (
                                        <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="username" {...field} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="telegramUsername" render={({ field }) => (
                                        <FormItem><FormLabel>Telegram</FormLabel><FormControl><Input placeholder="usuario" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full sm:w-auto min-w-[240px] text-lg font-bold shadow-lg shadow-primary/20 h-14" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                            {isSubmitting ? tCommon('saving') : tCommon('save')}
                        </Button>
                    </div>
                </form>
            </Form>

            <Card className="bg-muted/5">
                <CardHeader>
                    <CardTitle>{t('invite_section_title')}</CardTitle>
                    <CardDescription>{t('invite_section_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Input value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?invite=${userProfile.inviteCode}`} readOnly className="bg-muted" />
                        <Button onClick={handleCopyInviteLink} size="icon"><Copy className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center pt-8 space-y-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-sm" disabled={isDeleting}>
                            {t('delete_account.button')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>{t('delete_account.title')}</AlertDialogTitle><AlertDialogDescription>{t('delete_account.description')}</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('delete_account.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete_account.confirm')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Community Without Limits © 2026</p>
            </div>
        </div>
    );
}
