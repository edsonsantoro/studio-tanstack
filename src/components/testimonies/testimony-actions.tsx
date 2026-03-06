import { useTranslation } from 'react-i18next';
'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useNavigate } from '@tanstack/react-router';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@tanstack/react-router';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTestimony } from '@/actions/testimonies';

export function TestimonyActions({ testimonyId }: { testimonyId: string }) {
    const { i18n } = useTranslation();
    const locale = i18n.language;
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteTestimony({ data: testimonyId });
            if (result.success) {
                toast({ title: "Testemunho excluído com sucesso." });
                navigate({ to: '/$locale/testimonies', params: { locale }, search: {} as any });
            } else {
                toast({ variant: 'destructive', title: "Erro ao excluir", description: result.message });
                setIsDeleting(false);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao excluir", description: "Ocorreu um erro inesperado." });
            setIsDeleting(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link to="/$locale/testimonies/$id/edit" params={{ locale, id: testimonyId }} search={{}}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                        {isDeleting
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Trash2 className="mr-2 h-4 w-4" />
                        }
                        Excluir
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita e removerá permanentemente seu testemunho.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Confirmar Exclusão</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
