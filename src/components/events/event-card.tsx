import { useTranslation } from 'react-i18next';
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

export function EventCard({ event }: { event: any }) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
    const sortedDates = React.useMemo(() =>
        (event.dates || []).map((d: any) => new Date(d)).sort((a: Date, b: Date) => a.getTime() - b.getTime()),
        [event.dates]
    );

    const nextEventDate = sortedDates.find((d: Date) => d >= new Date());
    const displayDate = nextEventDate || sortedDates[0];

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <CardHeader className="p-0">
                <Link to="/$locale/events/$id" params={{ locale, id: event.id }} search={{}} className="block aspect-video relative">
                    <img
                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/400/225`}
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
                <CardTitle className="font-headline text-xl line-clamp-2 h-14 mb-2">
                    <Link to="/$locale/events/$id" params={{ locale, id: event.id }} search={{}} className="hover:underline">{event.name}</Link>
                </CardTitle>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {displayDate ? format(displayDate, "dd MMM yyyy", { locale: ptBR }) : 'Data a confirmar'}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{event.isOnline ? 'Evento Online' : event.location}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
                <Button asChild className="w-full">
                    <Link to="/$locale/events/$id" params={{ locale, id: event.id }} search={{}}>Ver Detalhes</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
