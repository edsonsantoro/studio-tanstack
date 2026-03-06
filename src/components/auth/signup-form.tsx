"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useRouter, useSearch, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LocationSearch } from '@/components/location-search';
import { Separator } from "@/components/ui/separator";
import { Loader2, UserCheck, XCircle, Gift } from "lucide-react";
import { register } from "@/actions/auth";
import { searchSponsors } from "@/actions/users";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter ao menos 2 caracteres." }),
  city: z.string().min(1, { message: "Cidade é obrigatória." }),
  country: z.string().min(1, { message: "País é obrigatório." }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres." }),
  languages: z.string().optional(),
  sponsorId: z.string().optional(),
});

type SignupFormValues = z.infer<typeof formSchema>;
type Sponsor = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

export function SignupForm() {
  const { t: t } = useTranslation('translation', { keyPrefix: 'signup' });
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const router = useRouter();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '__root__' }) as any;
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [sponsorSearchQuery, setSponsorSearchQuery] = React.useState('');
  const [sponsorSearchResults, setSponsorSearchResults] = React.useState<Sponsor[]>([]);
  const [isSearchingSponsors, setIsSearchingSponsors] = React.useState(false);
  const [selectedSponsor, setSelectedSponsor] = React.useState<Sponsor | null>(null);
  const [sponsorFromUrl, setSponsorFromUrl] = React.useState<{ id: string; name: string } | null>(null);
  const [inviteCodeFromUrl, setInviteCodeFromUrl] = React.useState<string | null>(null);


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      country: "",
      email: "",
      password: "",
      languages: "",
      sponsorId: "",
    },
  });

  React.useEffect(() => {
    const sponsorId = searchParams.sponsor;
    const inviteCode = searchParams.invite;

    if (sponsorId) {
      form.setValue('sponsorId', sponsorId);
    }

    if (inviteCode) {
      setInviteCodeFromUrl(inviteCode);
    }
  }, [searchParams, form]);


  React.useEffect(() => {
    if (sponsorSearchQuery.length < 2) {
      setSponsorSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setIsSearchingSponsors(true);
      const results = await searchSponsors({ data: sponsorSearchQuery });
      setSponsorSearchResults(results);
      setIsSearchingSponsors(false);
    }, 500); // Debounce search
    return () => clearTimeout(handler);
  }, [sponsorSearchQuery]);

  const handleSponsorSelect = (sponsor: Sponsor) => {
    form.setValue('sponsorId', sponsor.id);
    form.clearErrors('sponsorId');
    setSelectedSponsor(sponsor);
    setSponsorSearchResults([]);
    setSponsorSearchQuery('');
  };

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add invite code if present from URL
    if (inviteCodeFromUrl) {
      formData.append('inviteCode', inviteCodeFromUrl);
    }

    const { i18n } = useTranslation();
    const locale = i18n.language;

    try {
      const result = await register({ data: { prevState: null, formData } }) as any;

      if (result?.success) {
        toast({ title: t('success_toast_title'), description: t('success_toast_desc') });
        navigate({ to: '/$locale/dashboard', params: { locale } });
        router.invalidate();
        return;
      }

      if (result?.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          // @ts-ignore
          form.setError(field, { message: messages[0] });
        });
        toast({
          title: t('error_toast_title'),
          description: t('error_toast_desc'),
          variant: "destructive"
        });
      } else if (result?.message) {
        toast({
          title: t('error_toast_title'),
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Signup error", error);
      toast({
        title: t('error_toast_title'),
        description: ct('unexpected_error'),
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  }

  const handleLocationSelect = (location: { name: string; country: string; lat: number; lng: number; }) => {
    form.setValue("city", location.name);
    form.setValue("country", location.country);
    form.setValue("latitude", location.lat);
    form.setValue("longitude", location.lng);
    form.clearErrors("city");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>{t('full_name')}</FormLabel><FormControl><Input placeholder={ct('name')} {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="city" render={() => (
          <FormItem><FormLabel>{ct('location')}</FormLabel><FormControl><LocationSearch onLocationSelect={handleLocationSelect} initialValue={form.getValues('city')} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>{ct('email')}</FormLabel><FormControl><Input type="email" placeholder="seu@email.com" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>{ct('password')}</FormLabel><FormControl><Input type="password" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="languages" render={({ field }) => (
          <FormItem><FormLabel>{ct('languages')}</FormLabel><FormControl><Input placeholder={t('languages_placeholder')} {...field} disabled={isSubmitting} /></FormControl><FormDescription>{t('languages_description')}</FormDescription><FormMessage /></FormItem>
        )} />

        <Separator className="my-4" />

        {inviteCodeFromUrl ? (
          <div className="space-y-2 rounded-md border bg-green-50 dark:bg-green-950 p-4 text-center border-green-200 dark:border-green-800">
            <Gift className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">
              🎉 {t('sponsor_from_url_prompt')}
            </p>
            <p className="font-bold text-green-900 dark:text-green-100 text-lg">Membro da Comunidade</p>
            <p className="text-xs text-green-700 dark:text-green-300 pt-2">
              ✅ {t('sponsor_from_url_success')}
            </p>
          </div>
        ) : sponsorFromUrl ? (
          <div className="space-y-2 rounded-md border bg-green-50 dark:bg-green-950 p-4 text-center">
            <Gift className="mx-auto h-8 w-8 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">
              {t('sponsor_from_url_prompt')}
            </p>
            <p className="font-bold text-green-900 dark:text-green-100 text-lg">{sponsorFromUrl.name}</p>
            <p className="text-xs text-muted-foreground pt-2">
              {t('sponsor_from_url_success')}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="font-medium text-base">{t('sponsor_section_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('sponsor_section_desc')}
              </p>
            </div>
            <FormField control={form.control} name="sponsorId" render={() => (
              <FormItem>
                <FormLabel>{t('sponsor_label')}</FormLabel>
                {selectedSponsor ? (
                  <div className="flex items-center justify-between rounded-md border p-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <span className="font-medium">{selectedSponsor.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      setSelectedSponsor(null);
                      form.setValue('sponsorId', '');
                    }}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder={t('sponsor_search_placeholder')}
                        value={sponsorSearchQuery}
                        onChange={e => setSponsorSearchQuery(e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="off"
                      />
                    </FormControl>
                    {isSearchingSponsors && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                    {sponsorSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <ul>
                          {sponsorSearchResults.map((sponsor) => (
                            <li key={sponsor.id} onClick={() => handleSponsorSelect(sponsor)} className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
                              {sponsor.avatarUrl && <img src={sponsor.avatarUrl} alt={sponsor.name || ''} width={32} height={32} className="rounded-full" />}
                              <div>
                                <p className="font-medium text-sm">{sponsor.name}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />
          </>
        )}


        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {sponsorFromUrl
            ? (isSubmitting ? t('submitting_button_sponsored') : t('submit_button_sponsored'))
            : (isSubmitting ? t('submitting_button_default') : t('submit_button_default'))}
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {ct('or_continue_with')}
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <a href="/login/google">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </a>
      </Button>
      <Button variant="outline" className="w-full mt-2" asChild>
        <a href="/login/facebook">
          <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.88c0-2.474 1.283-4.414 4.646-4.414 1.48 0 2.989.192 3.633.262v3.428h-1.866c-1.336 0-1.587.668-1.587 1.876v1.728h3.842l-.612 3.667h-3.23v7.98H9.101z" />
          </svg>
          Facebook
        </a>
      </Button>
    </Form>
  );
}
