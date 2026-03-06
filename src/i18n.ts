export const locales = ['de', 'en', 'es', 'pt'];
export const defaultLocale = 'pt';

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
