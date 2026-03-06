'use client';

import * as React from 'react';
import { useRouter } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { upsertTranslation, addLocaleAction, removeLocaleAction, translateTextAction, upsertTranslationsBatch } from '@/actions/translations';
import { useDebouncedCallback } from 'use-debounce';
import { Loader2, Search, Plus, Trash2, Sparkles, Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


interface TranslationsClientProps {
    initialTranslations: {
        keys: string[];
        translations: Record<string, Record<string, string>>;
    };
    locales: string[];
    baseLocale: string;
}

export function TranslationsClient({ initialTranslations, locales, baseLocale }: TranslationsClientProps) {
    const { t } = useTranslation('translation', { keyPrefix: 'admin' });
    const { toast } = useToast();
    const router = useRouter();
    const [translations, setTranslations] = React.useState(initialTranslations.translations);
    const [savingStatus, setSavingStatus] = React.useState<Record<string, 'saving' | 'saved' | 'idle'>>({});

    // Filters and UI state
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedLocale, setSelectedLocale] = React.useState(locales.find(l => l !== baseLocale) || locales[0]);
    const [showMissingOnly, setShowMissingOnly] = React.useState(false);

    // State for managing locales
    const [isManageOpen, setIsManageOpen] = React.useState(false);
    const [newLocale, setNewLocale] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);
    const [isRemoving, setIsRemoving] = React.useState<string | null>(null);
    const [isConfirmingRemove, setIsConfirmingRemove] = React.useState<string | null>(null);

    // State for AI translations
    const [isTranslatingKey, setIsTranslatingKey] = React.useState<string | null>(null);
    const [isTranslatingAll, setIsTranslatingAll] = React.useState(false);


    const handleSave = useDebouncedCallback(async (key: string, locale: string, value: string) => {
        const statusKey = `${key}-${locale}`;
        setSavingStatus(prev => ({ ...prev, [statusKey]: 'saving' }));

        const result = await upsertTranslation({ data: { key: key, locale: locale, value: value } });

        if (result.success) {
            setSavingStatus(prev => ({ ...prev, [statusKey]: 'saved' }));
            setTimeout(() => {
                setSavingStatus(prev => ({ ...prev, [statusKey]: 'idle' }));
            }, 2000);
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: result.message,
            });
            setSavingStatus(prev => ({ ...prev, [statusKey]: 'idle' }));
        }
    }, 1000);

    const handleInputChange = (key: string, locale: string, value: string) => {
        setTranslations(prev => {
            const newTranslations = { ...prev };
            if (!newTranslations[locale]) {
                newTranslations[locale] = {};
            }
            newTranslations[locale][key] = value;
            return newTranslations;
        });
        handleSave(key, locale, value);
    };

    const filteredKeys = React.useMemo(() => {
        let keys = initialTranslations.keys;

        if (showMissingOnly) {
            keys = keys.filter(key => !translations[selectedLocale]?.[key]);
        }

        if (searchQuery) {
            keys = keys.filter(key =>
                key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (translations[baseLocale]?.[key] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (translations[selectedLocale]?.[key] || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return keys;
    }, [searchQuery, showMissingOnly, initialTranslations.keys, translations, selectedLocale, baseLocale]);

    const handleAddLocale = async () => {
        setIsAdding(true);
        const result = await addLocaleAction({ data: newLocale });
        if (result.success) {
            toast({ title: "Idioma adicionado!" });
            setNewLocale('');
            setIsManageOpen(false);
            router.invalidate();
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.message });
        }
        setIsAdding(false);
    }

    const handleRemoveLocale = async (localeToRemove: string) => {
        setIsRemoving(localeToRemove);
        const result = await removeLocaleAction({ data: localeToRemove });
        if (result.success) {
            toast({ title: 'Idioma removido!' });
            setIsConfirmingRemove(null);
            if (selectedLocale === localeToRemove) {
                setSelectedLocale(baseLocale);
            }
            router.invalidate();
        } else {
            toast({ variant: 'destructive', title: 'Erro', description: result.message });
        }
        setIsRemoving(null);
    }

    const handleTranslateOne = async (key: string) => {
        setIsTranslatingKey(key);
        const sourceText = translations[baseLocale]?.[key] || '';
        if (!sourceText) {
            toast({ variant: 'destructive', title: 'Texto base não encontrado.' });
            setIsTranslatingKey(null);
            return;
        }

        try {
            const result = await translateTextAction({ data: { text: sourceText, sourceLocale: baseLocale, targetLocale: selectedLocale } });
            if (result.success && result.translatedText) {
                handleInputChange(key, selectedLocale, result.translatedText);
            } else {
                toast({ variant: 'destructive', title: 'Falha na tradução', description: result.message });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Erro na tradução', description: e.message });
        } finally {
            setIsTranslatingKey(null);
        }
    };

    const handleTranslateAll = async () => {
        setIsTranslatingAll(true);
        const keysToTranslate = filteredKeys.filter(key => !translations[selectedLocale]?.[key] && translations[baseLocale]?.[key]);
        if (keysToTranslate.length === 0) {
            toast({ title: 'Nenhuma tradução pendente nesta visualização.' });
            setIsTranslatingAll(false);
            return;
        }

        const successfulTranslationsForBatchSave: { key: string, locale: string, value: string }[] = [];

        const translationPromises = keysToTranslate.map(key => {
            const sourceText = translations[baseLocale][key];
            return translateTextAction({ data: { text: sourceText, sourceLocale: baseLocale, targetLocale: selectedLocale } })
                .then(result => {
                    if (result.success && result.translatedText) {
                        // Update UI state immediately for each successful translation
                        setTranslations(prev => {
                            const newTranslations = { ...prev };
                            if (!newTranslations[selectedLocale]) {
                                newTranslations[selectedLocale] = {};
                            }
                            newTranslations[selectedLocale][key] = result.translatedText!;
                            return newTranslations;
                        });
                        // Collect for batch save
                        successfulTranslationsForBatchSave.push({
                            key,
                            locale: selectedLocale,
                            value: result.translatedText!,
                        });
                    }
                    return result;
                });
        });

        await Promise.all(translationPromises);

        if (successfulTranslationsForBatchSave.length > 0) {
            const saveResult = await upsertTranslationsBatch({ data: successfulTranslationsForBatchSave });
            if (!saveResult.success) {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao salvar traduções em lote',
                    description: saveResult.message,
                });
            }
        }

        toast({ title: 'Tradução em massa concluída', description: `${successfulTranslationsForBatchSave.length} de ${keysToTranslate.length} campos foram traduzidos.` });
        setIsTranslatingAll(false);
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row gap-4 p-4 border-b items-start sm:items-center">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('users_search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="missing-only"
                                checked={showMissingOnly}
                                onCheckedChange={(checked) => setShowMissingOnly(!!checked)}
                            />
                            <Label htmlFor="missing-only" className="text-sm cursor-pointer">
                                {t('translations_filter_missing')}
                            </Label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Selecione um idioma" />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map(locale => (
                                    <SelectItem key={locale} value={locale}>{locale.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={handleTranslateAll}
                            disabled={isTranslatingAll || selectedLocale === baseLocale}
                            className="w-full sm:w-auto"
                        >
                            {isTranslatingAll
                                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                : <Languages className="mr-2 h-4 w-4" />
                            }
                            IA
                        </Button>
                        <Button variant="outline" onClick={() => setIsManageOpen(true)}>
                            {t('translations_manage_locales')}
                        </Button>
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="hidden md:table-header-group">
                            <TableRow>
                                <TableHead className="w-[40%]">Chave (key)</TableHead>
                                <TableHead className="w-[60%]">
                                    Valor ({selectedLocale.toUpperCase()})
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredKeys.map(key => (
                                <TableRow key={key} className="flex flex-col md:table-row border-b md:border-b-0">
                                    <TableCell className="font-mono text-xs text-muted-foreground align-top pt-4 md:pt-5 pb-2 md:pb-4 block md:table-cell w-full md:w-auto">
                                        <span className="break-all text-sm md:text-xs font-medium md:font-normal text-foreground md:text-muted-foreground">{key}</span>
                                        <div className='text-xs text-muted-foreground/70 font-sans font-normal pt-1 break-words whitespace-normal'>
                                            Base ({baseLocale.toUpperCase()}): <span className='text-foreground/90'>{translations[baseLocale]?.[key] || '---'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="block md:table-cell w-full md:w-auto pt-0 pb-4 md:py-4">
                                        <div className="relative">
                                            <Input
                                                value={translations[selectedLocale]?.[key] || ''}
                                                onChange={(e) => handleInputChange(key, selectedLocale, e.target.value)}
                                                className="h-10 pr-10 w-full"
                                                placeholder={`Tradução para ${selectedLocale.toUpperCase()}`}
                                            />
                                            {savingStatus[`${key}-${selectedLocale}`] === 'saving' && (
                                                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                            )}
                                            {selectedLocale !== baseLocale && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                                    onClick={() => handleTranslateOne(key)}
                                                    disabled={isTranslatingKey === key || isTranslatingAll}
                                                    title="Traduzir com IA"
                                                >
                                                    {isTranslatingKey === key
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : <Sparkles className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                    }
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredKeys.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                        Nenhuma chave de tradução encontrada para sua busca.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerenciar Idiomas</DialogTitle>
                        <DialogDescription>
                            Adicione ou remova idiomas do seu site.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <h4 className="font-medium">Idiomas Atuais</h4>
                        <div className="space-y-2">
                            {locales.map(locale => (
                                <div key={locale} className="flex items-center justify-between rounded-md border p-2">
                                    <span className="font-mono text-sm">{locale}</span>
                                    {locale !== baseLocale ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setIsConfirmingRemove(locale)}
                                            disabled={isRemoving === locale}
                                        >
                                            {isRemoving === locale ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    ) : (
                                        <Badge variant="secondary">Base</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="font-medium">Adicionar Novo Idioma</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: fr, de, en-US"
                                    value={newLocale}
                                    onChange={(e) => setNewLocale(e.target.value)}
                                />
                                <Button onClick={handleAddLocale} disabled={isAdding || !newLocale}>
                                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    <span className="ml-2">Adicionar</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!isConfirmingRemove} onOpenChange={(open) => !open && setIsConfirmingRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação removerá o idioma '{isConfirmingRemove}' e seu arquivo de tradução. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className={buttonVariants({ variant: "destructive" })}
                            onClick={() => handleRemoveLocale(isConfirmingRemove!)}
                        >
                            Sim, Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
