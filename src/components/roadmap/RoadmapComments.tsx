'use client';

import { createRoadmapComment, getRoadmapComments, RoadmapCommentWithUser } from '@/actions/roadmap';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

interface RoadmapCommentsProps {
    itemId: string;
    commentCount: number;
}

export function RoadmapComments({ itemId, commentCount }: RoadmapCommentsProps) {
    const [comments, setComments] = useState<RoadmapCommentWithUser[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const data = await getRoadmapComments({ data: itemId });
            setComments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            try {
                await createRoadmapComment({ data: { itemId, content } });
                setContent('');
                await fetchComments();
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-semibold">{commentCount}</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-[450px]">
                <SheetHeader>
                    <SheetTitle>Comentários</SheetTitle>
                    <SheetDescription>
                        O que você acha desta feature? Deixe sua opinião.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-grow overflow-y-auto my-4 space-y-4 pr-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Sem comentários ainda.
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={comment.userAvatar || undefined} />
                                    <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col bg-muted/50 p-3 rounded-lg flex-grow">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold">{comment.userName}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('pt-BR') : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={handleAddComment} className="mt-auto space-y-2 pt-4 border-t">
                    <Textarea
                        placeholder="Escreva seu comentário..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[80px]"
                        disabled={isPending}
                    />
                    <Button type="submit" className="w-full gap-2" disabled={isPending || !content.trim()}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Enviar Comentário
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
