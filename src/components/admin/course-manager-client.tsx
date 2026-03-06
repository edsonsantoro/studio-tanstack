'use client';

import * as React from 'react';
import { HotmartProduct } from '@/lib/hotmart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { saveCourseLink, deleteCourseLink } from '@/actions/courses';
import { Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { Link, useRouter, useNavigate } from '@tanstack/react-router';

export function CourseManagerClient({ initialProducts }: { initialProducts: HotmartProduct[] }) {
    const [products, setProducts] = React.useState(initialProducts);
    const [loadingMap, setLoadingMap] = React.useState<Record<string, boolean>>({});
    const { toast } = useToast();
    const router = useRouter();
    const navigate = useNavigate();

    const handleSave = async (id: string, url: string, imageUrl: string) => {
        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const res = await saveCourseLink({ data: { hotmartId: id, manualUrl: url, manualImageUrl: imageUrl } });
            if (res.success) {
                toast({ title: "Salvo!", description: "Link e imagem atualizados com sucesso." });
                // Update local state is_hasManualLink flag (simplified)
                setProducts(prev => prev.map(p => p.id === id ? { ...p, url, imageUrl, _hasManualLink: !!url } : p));
                router.invalidate();
            } else {
                toast({ variant: "destructive", title: "Erro", description: (res as any).error || "Falha ao salvar." });
            }
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover configurações customizadas? O curso voltará a usar link e imagem automáticos.")) return;

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const res = await deleteCourseLink({ data: id });
            if (res.success) {
                toast({ title: "Removido", description: "Configurações manuais removidas." });
                // Refresh list
                setProducts(prev => prev.map(p => p.id === id ? { ...p, _hasManualLink: false } : p));
                router.invalidate();
            }
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Link Hotmart (Manual)</TableHead>
                        <TableHead>URL Imagem (Manual)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <ProductRow
                            key={product.id}
                            product={product}
                            isLoading={loadingMap[product.id]}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function ProductRow({ product, isLoading, onSave, onDelete }: {
    product: HotmartProduct,
    isLoading: boolean,
    onSave: (id: string, url: string, img: string) => void,
    onDelete: (id: string) => void
}) {
    const [url, setUrl] = React.useState(product.url || '');
    const [imageUrl, setImageUrl] = React.useState(product.imageUrl || '');

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground">ID: {product.id}</span>
                </div>
            </TableCell>
            <TableCell>
                <Input
                    className="max-w-xs h-8 text-xs"
                    placeholder="https://pay.hotmart.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </TableCell>
            <TableCell>
                <Input
                    className="max-w-xs h-8 text-xs"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        asChild
                    >
                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                        </a>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSave(product.id, url, imageUrl)}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={isLoading || !(product as any)._hasManualLink}
                        onClick={() => onDelete(product.id)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
