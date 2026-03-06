"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Ensure this path is correct
import { updateFeedbackSettings } from "@/actions/feedback";
import { Loader2, Save } from "lucide-react";

interface Feedback {
    id: string;
    content: string;
    pageUrl: string | null;
    userAgent: string | null;
    userId: string | null;
    createdAt: Date | null;
}

interface Settings {
    id: string;
    notifyEmail: string | null;
    sendEmailNotifications: boolean | null;
}

interface FeedbackClientProps {
    initialFeedbacks: Feedback[];
    initialSettings: Settings | null;
}

export function FeedbackClient({ initialFeedbacks, initialSettings }: FeedbackClientProps) {
    const [feedbacks] = useState(initialFeedbacks);
    const [settings, setSettings] = useState({
        notifyEmail: initialSettings?.notifyEmail || "",
        sendEmailNotifications: initialSettings?.sendEmailNotifications || false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const result = await updateFeedbackSettings({ data: {
                            notifyEmail: settings.notifyEmail,
                            sendEmailNotifications: settings.sendEmailNotifications,
                        } });

            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: "Configurações atualizadas com sucesso.",
                });
            } else {
                toast({
                    title: "Erro",
                    description: "Falha ao salvar configurações.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Notificação</CardTitle>
                    <CardDescription>
                        Gerencie como você recebe os feedbacks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="email-notifications"
                            checked={settings.sendEmailNotifications}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({ ...prev, sendEmailNotifications: checked }))
                            }
                        />
                        <Label htmlFor="email-notifications">Receber notificações por e-mail</Label>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail para notificações</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={settings.notifyEmail}
                                onChange={(e) =>
                                    setSettings((prev) => ({ ...prev, notifyEmail: e.target.value }))
                                }
                                disabled={!settings.sendEmailNotifications}
                            />
                            <Button onClick={handleSaveSettings} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Feedback</CardTitle>
                    <CardDescription>
                        Lista dos últimos feedbacks recebidos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="hidden md:table-header-group">
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Página</TableHead>
                                <TableHead>Conteúdo</TableHead>
                                <TableHead>User Agent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedbacks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Nenhum feedback recebido ainda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id} className="flex flex-col md:table-row border-b md:border-b-0">
                                        <TableCell className="whitespace-nowrap block md:table-cell w-full md:w-auto">
                                            <span className="md:hidden font-semibold mr-2 text-muted-foreground">Data:</span>
                                            {feedback.createdAt
                                                ? format(new Date(feedback.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="block md:table-cell w-full md:w-auto">
                                            <span className="md:hidden font-semibold mr-2 text-muted-foreground">Usuário:</span>
                                            {feedback.userId || "Anônimo"}
                                        </TableCell>
                                        <TableCell className="md:max-w-[200px] truncate block md:table-cell w-full md:w-auto" title={feedback.pageUrl || ""}>
                                            <span className="md:hidden font-semibold mr-2 text-muted-foreground">Página:</span>
                                            {feedback.pageUrl || "-"}
                                        </TableCell>
                                        <TableCell className="md:max-w-[300px] truncate block md:table-cell w-full md:w-auto" title={feedback.content}>
                                            <span className="md:hidden font-semibold mr-2 text-muted-foreground">Conteúdo:</span>
                                            {feedback.content}
                                        </TableCell>
                                        <TableCell className="md:max-w-[150px] truncate text-xs text-muted-foreground block md:table-cell w-full md:w-auto" title={feedback.userAgent || ""}>
                                            <span className="md:hidden font-semibold mr-2">User Agent:</span>
                                            {feedback.userAgent || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
