"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/actions/auth";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export function LoginForm() {
  const { t: t } = useTranslation('translation', { keyPrefix: 'login' });
  const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
  const router = useRouter();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      const result = await login({ data: { prevState: null, formData } }) as any;

      if (result?.success) {
        toast({ title: t('welcome_back') });
        navigate({ to: '/$locale/dashboard', params: { locale } });
        router.invalidate();
      } else {
        toast({
          title: t('login_failed'),
          description: (result as any)?.message || t('invalid_credentials'),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error("Login Error", e);
      toast({ title: ct('error'), description: t('unexpected_error'), variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ct('email')}</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>{ct('password')}</FormLabel>
                <Link
                  to="/$locale/forgot-password"
                  params={{ locale }}
                  className="ml-auto inline-block text-sm underline"
                >
                  {t('forgot_password')}
                </Link>
              </div>
              <FormControl>
                <Input type="password" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? ct('loading') : t('title')}
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
      <Button variant="outline" className="w-full mt-2" asChild>
        <a href="/login/twitter">
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X (Twitter)
        </a>
      </Button>
    </Form>
  );
}
