import { useTranslation } from 'react-i18next';
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, UserPlus, Edit, Loader2, Trash2 } from 'lucide-react';
import { toggleRSVP, deleteEvent } from '@/actions/events';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useNavigate, Link } from '@tanstack/react-router';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EventActions({ event, isPastEvent, user }: { event: any, isPastEvent: boolean, user: any }) {
    const { i18n } = useTranslation();
    const locale = i18n.language;
    const { toast } = useToast();
    const router = useRouter();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    const hasRSVPd = React.useMemo(() => {
        if (!user || !event?.attendeeIds) return false;
        return (event.attendeeIds as string[]).includes(user.userId);
    }, [user, event]);

    const isOrganizer = user?.userId === event?.organizerId || user?.role === 'admin';

    const handleRSVP = async () => {
        if (!user) {
            navigate({ to: '/$locale/login', params: { locale }, search: {} as any });
            return;
        }

        setIsUpdating(true);
        try {
            const result = await toggleRSVP({ data: { eventId: event.id, userId: user.userId } });
            if (result.success) {
                toast({
                    title: result.isAttending ? "Presença confirmada!" : "Inscrição cancelada",
                    description: result.isAttending ? "Nos vemos no evento!" : "Que pena que você não poderá ir.",
                });
                router.invalidate();
            } else {
                throw new Error("Erro ao atualizar presença.");
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao atualizar presença.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteEvent({ data: event.id });
            if (result.success) {
                toast({ title: "Evento removido com sucesso." });
                navigate({ to: '/$locale/events', params: { locale }, search: {} as any });
            } else {
                throw new Error(result.error || "Erro ao remover evento");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: error.message || "Falha ao remover o evento.",
            });
            setIsDeleting(false);
        }
    };

    if (!user) {
        return (
            <Button asChild size="lg" className="flex-grow">
                <Link to="/$locale/login" params={{ locale }} search={{}}>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Vou Participar (Login necessário)
                </Link>
            </Button>
        )
    }

    return (
        <div className="flex w-full items-center gap-2">
            {!isPastEvent && (
                <Button onClick={handleRSVP} size="lg" className="flex-grow" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                        hasRSVPd ? <Check className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />
                    }
                    {hasRSVPd ? "Presença Confirmada" : "Vou Participar"}
                </Button>
            )}

            {isOrganizer && (
                <Button asChild variant="outline" size="icon" className="h-12 w-12" title={isPastEvent ? "Editar Relato" : "Editar Evento"}>
                    <Link to="/$locale/events/$id/edit" params={{ locale, id: event.id }} search={{}}>
                        <Edit className="h-5 w-5" />
                        <span className="sr-only">{isPastEvent ? "Editar Relato" : "Editar Evento"}</span>
                    </Link>
                </Button>
            )}

            {isOrganizer && (
                <>
                    <Button variant="destructive" size="icon" className="h-12 w-12" onClick={() => setShowDeleteDialog(true)} title="Excluir Evento">
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Excluir Evento</span>
                    </Button>

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir o evento <span className="font-semibold">"{event.name}"</span>?
                                    Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}
