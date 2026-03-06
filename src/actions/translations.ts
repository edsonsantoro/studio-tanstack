import { db } from '@/db';
import { i18nTranslations } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { locales } from '@/i18n';
import fs from 'fs/promises';
import path from 'path';
 // /ai/flows/translate-text';
import { createServerFn } from "@tanstack/react-start";

async function updateLocalesArray(update: (locales: string[]) => string[]) {
    const i18nFilePath = path.join(process.cwd(), 'src', 'i18n.ts');
    const fileContent = await fs.readFile(i18nFilePath, 'utf8');

    const match = fileContent.match(/export const locales = (\[.*?\]);/);
    if (!match || !match[1]) {
        throw new Error("Não foi possível encontrar o array de idiomas em src/i18n.ts");
    }

    const currentLocales: string[] = JSON.parse(match[1].replace(/'/g, '"'));
    const newLocales = update(currentLocales);
    const newLocalesString = JSON.stringify(newLocales).replace(/"/g, "'");

    const newFileContent = fileContent.replace(match[0], `export const locales = ${newLocalesString};`);

    await fs.writeFile(i18nFilePath, newFileContent, 'utf8');
}
export const addLocaleActionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: locale }) => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: 'Não autorizado' };
}

if (!locale || locale.length > 5 || !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) {
    return { success: false, message: 'Código de idioma inválido. Use um formato como "fr" ou "en-US".' };
}

const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
try {
    await fs.writeFile(filePath, JSON.stringify({}, null, 2));
} catch(e) {
    return { success: false, message: 'Falha ao criar o arquivo de idioma.' };
}

try {
    await updateLocalesArray((locales) => {
        if (locales.includes(locale)) return locales;
        return [...locales, locale].sort();
    });
} catch(e: any) {
    await fs.unlink(filePath).catch(() => {}); // Rollback
    return { success: false, message: `Falha ao atualizar a configuração de idiomas: ${e.message}` };
}


return { success: true };
  });

export const addLocaleAction = addLocaleActionFn;
export const removeLocaleActionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: locale }) => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: 'Não autorizado' };
}

if (locale === 'pt') {
     return { success: false, message: 'Não é possível remover o idioma base.' };
}

const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
try {
    await fs.unlink(filePath);
} catch(e) {
    console.warn(`Não foi possível deletar ${filePath}, pode não existir.`);
}

 try {
    await updateLocalesArray((locales) => locales.filter(l => l !== locale));
} catch(e: any) {
    return { success: false, message: `Falha ao atualizar a configuração de idiomas: ${e.message}` };
}


return { success: true };
  });

export const removeLocaleAction = removeLocaleActionFn;
export const getTranslationsForAdminFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
}

try {
    const translationsByLocale: Record<string, Record<string, string>> = {};
    const allKeys = new Set<string>();

    // We use the centrally managed `locales` from i18n.ts
    for (const locale of locales) {
        const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
        let fileContent;
        try {
            fileContent = await fs.readFile(filePath, 'utf8');
        } catch (e) {
            await fs.writeFile(filePath, JSON.stringify({}, null, 2));
            fileContent = '{}';
        }
        
        const messages = JSON.parse(fileContent);
        translationsByLocale[locale] = {};

        const flattenMessages = (obj: any, prefix = '') => {
            if (typeof obj !== 'object' || obj === null) return;
            Object.keys(obj).forEach(key => {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    flattenMessages(obj[key], newKey);
                } else {
                    translationsByLocale[locale][newKey] = obj[key];
                    allKeys.add(newKey);
                }
            });
        };
        
        flattenMessages(messages);
    }

    return {
        keys: Array.from(allKeys).sort(),
        translations: translationsByLocale
    };

} catch (error) {
    console.error('Falha ao ler arquivos de tradução para admin:', error);
    return { keys: [], translations: {} };
}
  });

export const getTranslationsForAdmin = getTranslationsForAdminFn;
export const upsertTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string, locale: string, value: string }) => data)
  .handler(async ({ data }) => {
    const { key, locale, value } = data;
const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
}

try {
    const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
    let messages = {};
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        messages = JSON.parse(fileContent);
    } catch (e) {
        // File might not exist, that's fine.
    }
    
    const keys = key.split('.');
    let current: any = messages;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = current[keys[i]] || {};
    }
    current[keys[keys.length - 1]] = value;

    await fs.writeFile(filePath, JSON.stringify(messages, null, 2));

} catch (error: any) {
     console.error('Failed to update JSON translation file:', error);
    return { success: false, message: error.message || 'Error writing to file' };
}

try {
    const existingResult = await db.select().from(i18nTranslations).where(and(eq(i18nTranslations.key, key), eq(i18nTranslations.locale, locale))).limit(1);
    const existing = existingResult[0];

    if (existing) {
        await db.update(i18nTranslations)
            .set({ value: value, updatedAt: new Date() })
            .where(eq(i18nTranslations.id, existing.id));
    } else {
        await db.insert(i18nTranslations).values({
            key,
            locale,
            value
        });
    }
} catch (error: any) {
    console.warn('Database write for translation failed (but JSON succeeded):', error);
}


return { success: true };
  });

export const upsertTranslation = upsertTranslationFn;
export const upsertTranslationsBatchFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string; locale: string; value: string }[]) => data)
  .handler(async ({ data: translations }) => {
    const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
}

if (!translations || translations.length === 0) {
    return { success: true };
}

const locale = translations[0].locale;

// --- File System Update ---
try {
    const filePath = path.join(process.cwd(), 'src', 'messages', `${locale}.json`);
    let messages = {};
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        messages = JSON.parse(fileContent);
    } catch (e) {
        // File might not exist, that's fine.
    }

    for (const t of translations) {
        const keys = t.key.split('.');
        let current: any = messages;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]] = current[keys[i]] || {};
        }
        current[keys[keys.length - 1]] = t.value;
    }

    await fs.writeFile(filePath, JSON.stringify(messages, null, 2));

} catch (error: any) {
    console.error('Failed to update JSON translation file in batch:', error);
    return { success: false, message: error.message || 'Error writing to file' };
}

// --- Database Update (optional, best-effort) ---
try {
    for (const t of translations) {
        const existingResult = await db.select().from(i18nTranslations).where(and(eq(i18nTranslations.key, t.key), eq(i18nTranslations.locale, t.locale))).limit(1);
        const existing = existingResult[0];

        if (existing) {
            await db.update(i18nTranslations)
                .set({ value: t.value, updatedAt: new Date() })
                .where(eq(i18nTranslations.id, existing.id));
        } else {
            await db.insert(i18nTranslations).values({
                key: t.key,
                locale: t.locale,
                value: t.value
            });
        }
    }
} catch (error: any) {
    console.warn('Database batch write for translation failed (but JSON succeeded):', error);
}


return { success: true };
  });

export const upsertTranslationsBatch = upsertTranslationsBatchFn;
export const translateTextActionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { text: string, sourceLocale: string, targetLocale: string }) => data)
  .handler(async ({ data }) => {
    const { text, sourceLocale, targetLocale } = data;
const session = await getUser();
if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
}

if (!text) {
    return { success: false, message: 'No text provided to translate.' };
}

try {
    const result = await translateText({ text, sourceLocale, targetLocale });
    return { success: true, translatedText: result.translatedText };
} catch (error: any) {
    console.error('Failed to translate text via AI flow:', error);
    return { success: false, message: error.message || 'Error during translation' };
}
  });

export const translateTextAction = translateTextActionFn;
