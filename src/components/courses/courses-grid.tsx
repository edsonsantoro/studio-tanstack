'use client';

import * as React from 'react';
import type { HotmartProduct } from '@/lib/hotmart';
import { CourseCard } from '@/components/courses/course-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

type SortOption = 'price-asc' | 'price-desc' | 'type-subscription' | 'type-course';

export function CoursesGrid({ initialProducts }: { initialProducts: HotmartProduct[] }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortBy, setSortBy] = React.useState<SortOption>('price-asc');

    const filteredAndSorted = React.useMemo(() => {
        let result = [...initialProducts];

        // Filter by search term
        if (searchTerm) {
            result = result.filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return parsePrice(a.price) - parsePrice(b.price);
                case 'price-desc':
                    return parsePrice(b.price) - parsePrice(a.price);
                case 'type-subscription':
                    // Subscriptions first
                    const aIsSub = a.periodicity && a.periodicity !== '';
                    const bIsSub = b.periodicity && b.periodicity !== '';
                    if (aIsSub && !bIsSub) return -1;
                    if (!aIsSub && bIsSub) return 1;
                    return 0;
                case 'type-course':
                    // One-time courses first
                    const aIsOnce = !a.periodicity || a.periodicity === '';
                    const bIsOnce = !b.periodicity || b.periodicity === '';
                    if (aIsOnce && !bIsOnce) return -1;
                    if (!aIsOnce && bIsOnce) return 1;
                    return 0;
                default:
                    return 0;
            }
        });

        return result;
    }, [initialProducts, searchTerm, sortBy]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título... (ex: coração)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Ordenar por..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="price-asc">Preço: Menor → Maior</SelectItem>
                        <SelectItem value="price-desc">Preço: Maior → Menor</SelectItem>
                        <SelectItem value="type-subscription">Tipo: Assinaturas</SelectItem>
                        <SelectItem value="type-course">Tipo: Cursos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results */}
            {filteredAndSorted.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {filteredAndSorted.map(course => (
                        <CourseCard key={`filtered-${course.id}`} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-background rounded-lg border border-dashed">
                    <p className="text-muted-foreground">
                        {searchTerm ? `Nenhum curso encontrado para "${searchTerm}"` : 'Nenhum curso encontrado.'}
                    </p>
                </div>
            )}
        </div>
    );
}

function parsePrice(priceStr: string): number {
    // Extract number from price string like "R$ 100" or "$ 50"
    const match = priceStr.match(/[\d.,]+/);
    if (!match) return 0;
    return parseFloat(match[0].replace(',', '.'));
}
