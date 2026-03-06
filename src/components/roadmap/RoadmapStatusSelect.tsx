
'use client';

import { updateRoadmapItemStatus } from '@/actions/roadmap';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTransition } from 'react';
import { toast } from '@/hooks/use-toast';

interface RoadmapStatusSelectProps {
    itemId: string;
    currentStatus: string;
}

export function RoadmapStatusSelect({ itemId, currentStatus }: RoadmapStatusSelectProps) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (value: string) => {
        startTransition(async () => {
            try {
                await updateRoadmapItemStatus({ data: { itemId, status: value } });
                toast({ title: "Status atualizado!" });
            } catch (error) {
                toast({ title: "Erro ao atualizar status", variant: "destructive" });
            }
        });
    };

    return (
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger className="w-[140px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="suggestion">Sugestão</SelectItem>
                <SelectItem value="planned">Planejado</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="declined">Recusado</SelectItem>
            </SelectContent>
        </Select>
    );
}
