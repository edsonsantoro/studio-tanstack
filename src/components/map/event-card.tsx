import { useTranslation } from 'react-i18next';
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Event } from '@/lib/types';
import { X, Calendar, MapPin } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

type EventCardProps = {
  event: Event;
  onClose: () => void;
};

export function EventCard({ event, onClose }: EventCardProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const sortedDates = React.useMemo(() =>
    (event.dates || []).map((d: any) => {
      if (d && typeof d.toDate === 'function') return d.toDate();
      return new Date(d);
    }).sort((a, b) => a.getTime() - b.getTime()),
    [event.dates]);

  const nextEventDate = sortedDates.find(d => d >= new Date());
  const displayDate = nextEventDate || sortedDates[0];

  return (
    <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-80 max-w-[90vw] shadow-2xl animate-in fade-in zoom-in-95">
      <CardHeader className="flex flex-row items-start p-4">
        <div className="flex-grow space-y-1">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {displayDate ? format(displayDate, "dd/MM/yy 'às' HH:mm", { locale: ptBR }) : 'Data a confirmar'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{event.isOnline ? 'Evento Online' : event.location}</span>
        </div>
        <Button asChild className="w-full">
          <Link to="/$locale/events/$id" params={{ locale, id: event.id }} search={{}}>Ver Detalhes do Evento</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
