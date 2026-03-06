"use client";

import * as React from "react";
import ISO6391 from "iso-639-1";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Get all languages with their native names
const languages = ISO6391.getAllCodes().map((code) => ({
    code,
    name: ISO6391.getName(code),
    nativeName: ISO6391.getNativeName(code),
})).sort((a, b) => a.name.localeCompare(b.name));

interface LanguageSelectorProps {
    value: string[];
    onChange: (languages: string[]) => void;
    placeholder?: string;
}

export function LanguageSelector({
    value = [],
    onChange,
    placeholder = "Selecione idiomas...",
}: LanguageSelectorProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (languageName: string) => {
        const isSelected = value.includes(languageName);
        if (isSelected) {
            onChange(value.filter((lang) => lang !== languageName));
        } else {
            onChange([...value, languageName]);
        }
    };

    const handleRemove = (languageName: string) => {
        onChange(value.filter((lang) => lang !== languageName));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value.length > 0 ? `${value.length} idioma(s) selecionado(s)` : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar idioma..." />
                        <CommandEmpty>Nenhum idioma encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {languages.map((language) => (
                                <CommandItem
                                    key={language.code}
                                    value={language.name}
                                    onSelect={() => handleSelect(language.name)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(language.name) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{language.name}</span>
                                        {language.nativeName !== language.name && (
                                            <span className="text-xs text-muted-foreground">
                                                {language.nativeName}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((languageName) => (
                        <Badge key={languageName} variant="secondary" className="gap-1">
                            {languageName}
                            <button
                                type="button"
                                onClick={() => handleRemove(languageName)}
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remover {languageName}</span>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
