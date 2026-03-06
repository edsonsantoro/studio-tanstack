'use client';

import { useState } from "react";
import { RecommendationCard } from "@/components/testimonies/recommendation-card";
import { approveRecommendationByAdmin, rejectRecommendation } from "@/actions/recommendations";
import { useToast } from "@/hooks/use-toast";

export function RecommendationsAdminClient({ initialRecommendations }: { initialRecommendations: any[] }) {
    const [recommendations, setRecommendations] = useState(initialRecommendations);
    const { toast } = useToast();

    const handleApprove = async (id: string) => {
        const result = await approveRecommendationByAdmin({ data: id });
        if (result.success) {
            setRecommendations(prev => prev.filter(r => r.id !== id));
            toast({ title: "Indicação aprovada!", description: "O usuário receberá um alerta para aprovar no perfil dele." });
        }
    };

    const handleReject = async (id: string) => {
        const result = await rejectRecommendation({ data: id });
        if (result.success) {
            setRecommendations(prev => prev.filter(r => r.id !== id));
            toast({ title: "Indicação rejeitada", variant: "destructive" });
        }
    };

    if (recommendations.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground">Nenhuma indicação pendente para revisão.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map(rec => (
                <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isAdmin
                />
            ))}
        </div>
    );
}
