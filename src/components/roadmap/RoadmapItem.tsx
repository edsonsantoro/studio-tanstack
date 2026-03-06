'use client';

import type { RoadmapItemWithVotes, voteOnItem } from '@/actions/roadmap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowBigDown, ArrowBigUp, CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react';
import { useOptimistic, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { RoadmapComments } from './RoadmapComments';

interface RoadmapItemProps {
    item: RoadmapItemWithVotes;
    userId?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    suggestion: { label: 'Sugestão', color: 'bg-slate-500', icon: Circle },
    planned: { label: 'Planejado', color: 'bg-blue-500', icon: Clock },
    in_progress: { label: 'Em Progresso', color: 'bg-yellow-500', icon: Loader2 },
    completed: { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle2 },
    declined: { label: 'Recusado', color: 'bg-red-500', icon: XCircle },
};

export function RoadmapItem({ item, userId }: RoadmapItemProps) {
    const [isPending, startTransition] = useTransition();

    const [optimisticVote, addOptimisticVote] = useOptimistic(
        { count: item.voteCount, userVote: item.userVote },
        (state, newVote: number) => {
            const voteVal = newVote as (1 | -1);
            if (state.userVote === voteVal) {
                return { count: state.count - voteVal, userVote: 0 };
            }
            if (state.userVote === 0) {
                return { count: state.count + voteVal, userVote: voteVal };
            }
            // Changing vote from 1 to -1 or vice versa
            return { count: state.count + (2 * voteVal), userVote: voteVal };
        }
    );

    const handleVote = (type: 1 | -1) => {
        if (!userId) return;

        startTransition(async () => {
            addOptimisticVote(type);
            await voteOnItem({ data: { itemId: item.id, voteType: type } });
        });
    };

    const status = statusConfig[item.status] || statusConfig.suggestion;
    const StatusIcon = status.icon;

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <Badge variant="outline" className={cn("mb-2 gap-1 w-fit", status.color, "text-white border-transparent")}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </Badge>
                    {item.authorName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground" title={`Sugerido por ${item.authorName}`}>
                            <Avatar className="w-5 h-5">
                                <AvatarImage src={item.authorAvatar || undefined} />
                                <AvatarFallback>{item.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </div>
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between border-t p-4 mt-auto bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-background rounded-full border shadow-sm p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 hover:bg-green-100 hover:text-green-600 rounded-full",
                                optimisticVote.userVote === 1 && "text-green-600 bg-green-50"
                            )}
                            onClick={() => handleVote(1)}
                            disabled={isPending || !userId}
                        >
                            <ArrowBigUp className={cn("w-6 h-6", optimisticVote.userVote === 1 && "fill-current")} />
                        </Button>
                        <span className={cn(
                            "font-bold min-w-[1.5rem] text-center text-sm",
                            optimisticVote.userVote === 1 ? "text-green-600" : optimisticVote.userVote === -1 ? "text-red-600" : "text-muted-foreground"
                        )}>
                            {optimisticVote.count}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 hover:bg-red-100 hover:text-red-600 rounded-full",
                                optimisticVote.userVote === -1 && "text-red-600 bg-red-50"
                            )}
                            onClick={() => handleVote(-1)}
                            disabled={isPending || !userId}
                        >
                            <ArrowBigDown className={cn("w-6 h-6", optimisticVote.userVote === -1 && "fill-current")} />
                        </Button>
                    </div>

                    <RoadmapComments itemId={item.id} commentCount={item.commentCount} />
                </div>
                <div className="text-xs text-muted-foreground">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : ''}
                </div>
            </CardFooter>
        </Card>
    );
}
