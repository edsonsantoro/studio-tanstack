'use client';
import { useLocation, useRouter } from '@tanstack/react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n';
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  
  // Get locale from route params to ensure it matches our defined locales
  const matches = router.state.matches;
  const localeMatch = matches.find((m) => m.params && (m.params as any).locale);
  const currentLocale = (localeMatch?.params as any)?.locale || i18n.language.slice(0, 2);

  const onSelectChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    router.navigate({
      replace: true,
      to: '.',
      params: (prev: any) => ({ ...prev, locale: newLocale }),
      search: (prev: any) => prev,
    });
  };

  return (
    <Select value={currentLocale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-auto gap-2 border-none bg-transparent shadow-none focus:ring-0">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
