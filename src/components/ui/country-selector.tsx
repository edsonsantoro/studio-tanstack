"use client";

import * as React from "react";
import countries from "@/lib/countries.json";
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

interface CountrySelectorProps {
    value: string[];
    onChange: (countries: string[]) => void;
    placeholder?: string;
}

export function CountrySelector({
    value = [],
    onChange,
    placeholder = "Selecione países...",
}: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (countryName: string) => {
        const isSelected = value.includes(countryName);
        if (isSelected) {
            onChange(value.filter((c) => c !== countryName));
        } else {
            onChange([...value, countryName]);
        }
    };

    const handleRemove = (countryName: string) => {
        onChange(value.filter((c) => c !== countryName));
    };

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-10 py-2"
                    >
                        <div className="flex flex-wrap gap-1 text-left">
                            {value.length > 0 
                                ? `${value.length} país(es) selecionado(s)` 
                                : placeholder}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar país..." />
                        <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => handleSelect(country.name)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(country.name) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span>{country.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {value.map((countryName) => (
                        <Badge key={countryName} variant="secondary" className="gap-1 pr-1">
                            {countryName}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemove(countryName);
                                }}
                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted p-0.5"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remover {countryName}</span>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
