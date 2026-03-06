'use client';

import { createRoadmapItem } from '@/actions/roadmap';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@tanstack/react-router';

export function CreateRoadmapItem() {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title || !description) return;

        startTransition(async () => {
            try {
                const result = await createRoadmapItem({ data: { title, description } }) as any;
                if (result.success) {
                    setOpen(false);
                    toast({ title: "Sua sugestão foi enviada!", description: "Obrigado por contribuir." });
                    router.invalidate();
                } else {
                    toast({ title: "Erro ao enviar", description: result.message, variant: "destructive" });
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Erro ao enviar", variant: "destructive" });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Sugerir Feature
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sugerir Nova Feature</DialogTitle>
                    <DialogDescription>
                        Tem uma ideia para a plataforma? Descreva abaixo e a comunidade poderá votar!
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" name="title" placeholder="Ex: Modo Escuro" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Descreva como essa feature ajudaria você..."
                            required
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Sugestão
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
