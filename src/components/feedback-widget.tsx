'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import { submitFeedback } from '@/actions/feedback';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        // Check if user has seen the tooltip
        const hasSeen = localStorage.getItem('has_seen_feedback_tooltip');
        if (!hasSeen) {
            // Show tooltip after a short delay to be noticeable
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && showTooltip) {
            setShowTooltip(false);
            localStorage.setItem('has_seen_feedback_tooltip', 'true');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await submitFeedback({
                data: {
                    content,
                    pageUrl: window.location.href, // full URL including query params
                    userAgent: navigator.userAgent,
                }
            });

            if (result.success) {
                toast({
                    title: "Obrigado!",
                    description: "Seu feedback foi enviado com sucesso.",
                });
                setIsOpen(false);
                setContent('');
            } else {
                toast({
                    title: "Erro",
                    description: "Não foi possível enviar o feedback. Tente novamente.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <TooltipProvider>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110",
                                    "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                                aria-label="Feedback"
                            >
                                <MessageSquare className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                        side="left"
                        align="center"
                        className="bg-primary text-primary-foreground max-w-[200px] p-4 text-center text-sm font-medium animate-in fade-in zoom-in slide-in-from-right-2"
                    >
                        <p>Nova ferramenta de feedback! Clique para nos contar o que achou.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enviar Feedback</DialogTitle>
                    <DialogDescription>
                        Encontrou um erro ou tem uma sugestão? Conte para nós!
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <Textarea
                        placeholder="Descreva sua experiência, problema ou sugestão..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[120px]"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Informações da página e do navegador serão enviadas enviadas automaticamente para ajudar na resolução.
                    </p>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Enviar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
