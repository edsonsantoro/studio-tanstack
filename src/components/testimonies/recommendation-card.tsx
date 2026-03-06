'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, X, AlertCircle } from "lucide-react";

interface RecommendationCardProps {
    recommendation: {
        id: string;
        materialName: string;
        productData: any;
        testimonyTitle?: string;
        authorName?: string;
    };
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    isAdmin?: boolean;
}

import { useTranslation } from "react-i18next";

export function RecommendationCard({ recommendation, onApprove, onReject, isAdmin }: RecommendationCardProps) {
    const { t: t } = useTranslation('translation', { keyPrefix: 'dashboard' });
    const { productData } = recommendation;
    const hasProduct = productData && productData.id;

    return (
        <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <Badge variant="outline" className="mb-2">{t('recommendation_badge')}</Badge>
                        <CardTitle className="text-lg">{recommendation.materialName}</CardTitle>
                        {recommendation.testimonyTitle && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('recommendation_in_testimony', { title: recommendation.testimonyTitle })}
                            </p>
                        )}
                        {recommendation.authorName && (
                            <p className="text-xs text-muted-foreground font-headline">
                                {t('recommendation_author', { name: recommendation.authorName })}
                            </p>
                        )}
                    </div>
                    {!hasProduct && (
                        <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                {hasProduct ? (
                    <div className="flex gap-4">
                        {productData.imageUrl && (
                            <div className="h-20 w-20 rounded bg-muted overflow-hidden shrink-0">
                                <img src={productData.imageUrl} alt={productData.name} className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-sm">{productData.name}</p>
                            <p className="text-primary font-bold">{productData.price}</p>
                            <Button variant="link" size="sm" className="px-0 h-auto gap-1" asChild>
                                <a href={productData.url} target="_blank" rel="noopener noreferrer">
                                    {t('recommendation_view_hotmart')} <ExternalLink className="h-3 w-3" />
                                </a>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground italic bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                        {t('recommendation_not_found')}
                        {isAdmin && t('recommendation_admin_hint')}
                    </div>
                )}
            </CardContent>

            {(onApprove || onReject) && (
                <CardFooter className="bg-muted/10 gap-2 justify-end pt-3">
                    {onReject && (
                        <Button variant="ghost" size="sm" onClick={() => onReject(recommendation.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <X className="h-4 w-4 mr-1" /> {t('recommendation_button_reject')}
                        </Button>
                    )}
                    {onApprove && (
                        <Button variant="default" size="sm" onClick={() => onApprove(recommendation.id)}>
                            <Check className="h-4 w-4 mr-1" /> {isAdmin ? t('recommendation_button_approve_admin') : t('recommendation_button_approve_user')}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
