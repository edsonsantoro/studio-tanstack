'use client';

import * as React from 'react';
import { Link } from '@tanstack/react-router';
import type { Testimony } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Globe, Lock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useTranslation } from "react-i18next";

export function TestimonyCard({ testimony }: { testimony: Testimony }) {
    const { t: t } = useTranslation('translation', { keyPrefix: 'testimonies' });
  const { i18n } = useTranslation();
  const locale = i18n.language;
    const authorName = testimony.authorName || 'Anônimo';

    const timeAgo = testimony.createdAt
        ? formatDistanceToNow(new Date(testimony.createdAt), { addSuffix: true, locale: ptBR })
        : '';

    return (
        <Link to="/$locale/testimonies/$id" params={{ locale, id: testimony.id }} search={{}} className="block">
            <Card className="flex flex-col h-full hover:border-primary transition-colors">
                <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{testimony.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-4">{testimony.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className='flex items-center gap-2'>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={testimony.authorAvatarUrl || ''} alt={authorName} />
                            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{authorName.split(' ')[0]}</span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span>{timeAgo}</span>
                        <Badge variant={testimony.isPublic ? "secondary" : "outline"} className="gap-1 pr-1.5 pl-1">
                            {testimony.isPublic
                                ? <Globe className="h-3 w-3" />
                                : <Lock className="h-3 w-3" />
                            }
                            <span>{testimony.isPublic ? t('card_public') : t('card_members_only')}</span>
                        </Badge>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
