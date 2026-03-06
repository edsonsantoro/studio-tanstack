'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, HelpCircle, Loader2 } from 'lucide-react';
import { confirmRSVP, cancelRSVP } from '@/actions/rsvp';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RSVPButtonProps {
    eventId: string;
    userId: string;
    initialStatus: 'confirmed' | 'declined' | 'maybe' | null;
    confirmedCount?: number;
}

export function RSVPButton({ eventId, userId, initialStatus, confirmedCount = 0 }: RSVPButtonProps) {
    const [status, setStatus] = React.useState<'confirmed' | 'declined' | 'maybe' | null>(initialStatus);
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();

    const handleRSVP = async (newStatus: 'confirmed' | 'declined' | 'maybe') => {
        setIsLoading(true);
        const result = await confirmRSVP({ data: { eventId, userId, status: newStatus } });

        if (result.success) {
            setStatus(newStatus);
            toast({
                title: 'Sucesso!',
                description: (result as any).message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: (result as any).message,
            });
        }

        setIsLoading(false);
    };

    const handleCancel = async () => {
        setIsLoading(true);
        const result = await cancelRSVP({ data: { eventId, userId } });

        if (result.success) {
            setStatus(null);
            toast({
                title: 'Cancelado',
                description: (result as any).message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: (result as any).message,
            });
        }

        setIsLoading(false);
    };

    const getButtonContent = () => {
        if (isLoading) {
            return (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                </>
            );
        }

        switch (status) {
            case 'confirmed':
                return (
                    <>
                        <Check className="h-4 w-4 mr-2" />
                        Presença Confirmada
                    </>
                );
            case 'declined':
                return (
                    <>
                        <X className="h-4 w-4 mr-2" />
                        Não Vou
                    </>
                );
            case 'maybe':
                return (
                    <>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Talvez
                    </>
                );
            default:
                return 'Confirmar Presença';
        }
    };

    const getButtonVariant = () => {
        switch (status) {
            case 'confirmed':
                return 'default';
            case 'declined':
                return 'destructive';
            case 'maybe':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-2">
            {confirmedCount > 0 && (
                <p className="text-sm text-muted-foreground">
                    ✅ {confirmedCount} {confirmedCount === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}
                </p>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={getButtonVariant()}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {getButtonContent()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => handleRSVP('confirmed')}>
                        <Check className="h-4 w-4 mr-2" />
                        Vou Participar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRSVP('maybe')}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Talvez
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRSVP('declined')}>
                        <X className="h-4 w-4 mr-2" />
                        Não Vou
                    </DropdownMenuItem>
                    {status && (
                        <DropdownMenuItem onClick={handleCancel} className="text-destructive">
                            Cancelar Resposta
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
