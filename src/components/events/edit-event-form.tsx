'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LocationSearch } from '@/components/location-search';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, Hourglass, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { eventFormSchema } from '@/lib/schemas';
import { updateEvent } from '@/actions/events';
import { useTranslation } from "react-i18next";

type FormValues = z.infer<typeof eventFormSchema>;

export function EditEventForm({ event, user }: { event: any, user: any }) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const router = useRouter();
    const { i18n } = useTranslation();
    const locale = i18n.language;
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: event.name || '',
            description: event.description || '',
            dates: (event.dates || []).map((d: any) => new Date(d)),
            startTime: event.startTime || '',
            durationHours: (event.durationHours || '') as any,
            recurrenceDescription: event.recurrenceDescription || '',
            isOnline: event.isOnline || false,
            isPublic: event.isPublic || false,
            location: event.location || '',
            onlineUrl: event.onlineUrl || '',
            imageUrl: event.imageUrl || '',
            latitude: (event.coords as any)?.lat,
            longitude: (event.coords as any)?.lng,
            postEventDescription: event.postEventDescription || '',
            postEventImageUrls: Array.isArray(event.postEventImageUrls) ? event.postEventImageUrls.join(', ') : (event.postEventImageUrls || ''),
        },
    });

    const isOnline = form.watch('isOnline');
    const selectedDates = form.watch('dates');
    const imageUrlPreview = form.watch('imageUrl');

    const handleLocationSelect = (location: { name: string; country: string; lat: number; lng: number; }) => {
        form.setValue("location", `${location.name}, ${location.country}`);
        form.setValue("city", location.name);
        form.setValue("country", location.country);
        form.setValue("latitude", location.lat);
        form.setValue("longitude", location.lng);
        form.clearErrors("location");
    };

    async function onSubmit(data: FormValues) {
        if (!user) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
            return;
        }

        const userId = user.userId || user.id;
        if (userId !== event.organizerId && user.role !== 'admin') {
            toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você não tem permissão para editar este evento.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const eventData: any = {
                name: data.name,
                description: data.description,
                dates: data.dates,
                isOnline: data.isOnline,
                isPublic: data.isPublic || false,
            };

            if (data.startTime) eventData.startTime = data.startTime;
            if (data.durationHours) eventData.durationHours = data.durationHours;
            if (data.recurrenceDescription) eventData.recurrenceDescription = data.recurrenceDescription;
            if (data.location) eventData.location = data.location;
            if (data.onlineUrl) eventData.onlineUrl = data.onlineUrl;
            if (data.latitude && data.longitude) {
                eventData.coords = { lat: data.latitude, lng: data.longitude };
            }

            if (data.imageUrl) eventData.imageUrl = data.imageUrl;

            if (data.postEventDescription) eventData.postEventDescription = data.postEventDescription;
            if (data.postEventImageUrls) {
                eventData.postEventImageUrls = data.postEventImageUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url.length > 0);
            }

            const result = await updateEvent({ data: { eventId: event.id, eventData } });

            if (result.success) {
                toast({
                    title: 'Evento Atualizado!',
                    description: `O evento "${data.name}" foi atualizado com sucesso.`,
                });
                navigate({ to: '/$locale/events/$id', params: { locale, id: event.id } });
                router.invalidate();
            } else {
                throw new Error("Falha ao atualizar evento");
            }

        } catch (error: any) {
            console.error("Error updating event:", error);
            toast({
                variant: "destructive",
                title: "Erro ao atualizar evento",
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const userId = user?.userId || user?.id;
    if (user && userId !== event.organizerId && user.role !== 'admin') {
        return <div className="text-center p-8 text-red-500">Você não tem permissão para editar este evento.</div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Editar Evento</CardTitle>
                        <CardDescription>
                            Ajuste as informações do seu evento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Evento</FormLabel>
                                <FormControl><Input placeholder="Ex: Café com a Comunidade" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl><Textarea placeholder="Detalhes sobre o que vai acontecer..." {...field} rows={5} /></FormControl>
                                <FormDescription>Seja claro e convidativo.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="dates" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Datas do Evento</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value?.length && "text-muted-foreground"
                                                )}
                                            >
                                                {selectedDates?.length > 0 ? (
                                                    `${selectedDates.length} data(s) selecionada(s)`
                                                ) : (
                                                    <span>Escolha as datas</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="multiple"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>Selecione um ou mais dias no calendário.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="startTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Horário de Início</FormLabel>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl><Input type="time" className="pl-10" {...field} /></FormControl>
                                    </div>
                                    <FormDescription>Para todas as datas selecionadas.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="durationHours" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração (em horas)</FormLabel>
                                    <div className="relative">
                                        <Hourglass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl><Input type="number" placeholder="Ex: 2.5" className="pl-10" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : +e.target.value)} /></FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="recurrenceDescription" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição da Recorrência (Opcional)</FormLabel>
                                <FormControl><Textarea placeholder="Ex: Toda primeira quinta-feira do mês, exceto feriados." {...field} rows={2} /></FormControl>
                                <FormDescription>Use para regras complexas que o calendário não cobre.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL da Imagem de Capa (Opcional)</FormLabel>
                                <FormControl><Input placeholder="https://exemplo.com/imagem.jpg" {...field} /></FormControl>
                                {imageUrlPreview && (
                                    <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                        <img
                                            src={imageUrlPreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                                <FormDescription>Use uma imagem que represente bem seu evento.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />


                        <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                            <FormField control={form.control} name="isOnline" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-semibold">Este é um evento online?</FormLabel>
                                        <FormDescription>
                                            Escolha entre um link ou um local físico.
                                        </FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />

                            {isOnline ? (
                                <FormField control={form.control} name="onlineUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link do Evento Online</FormLabel>
                                        <FormControl><Input placeholder="https://zoom.us/j/..." {...field} /></FormControl>
                                        <FormDescription>Link do Zoom, Google Meet, etc.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            ) : (
                                <FormField control={form.control} name="location" render={() => (
                                    <FormItem>
                                        <FormLabel>Localização do Evento Presencial</FormLabel>
                                        <FormControl><LocationSearch
                                            onLocationSelect={handleLocationSelect}
                                            initialValue={form.getValues('location') || ''}
                                        /></FormControl>
                                        <FormDescription>Digite o endereço e selecione uma opção.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>


                        <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/10">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Evento Público</FormLabel>
                                        <FormDescription>
                                            Se ativado, este evento será visível para pessoas sem uma conta.
                                        </FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-semibold">Relato do Evento (Pós-evento)</h3>
                            <p className="text-sm text-muted-foreground">Preencha estas informações apenas após a realização do evento.</p>

                            <FormField control={form.control} name="postEventDescription" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Como foi o evento?</FormLabel>
                                    <FormControl><Textarea placeholder="Conte como foi a experiência, resultados, etc..." {...field} rows={4} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="postEventImageUrls" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URLs de Imagens do Relato (separadas por vírgula)</FormLabel>
                                    <FormControl><Input placeholder="https://..., https://..." {...field} /></FormControl>
                                    <FormDescription>Links para fotos do evento realizado.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 px-6 pb-6">
                        <Button type="button" variant="outline" onClick={() => navigate({ to: '/$locale/events/$id', params: { locale, id: event.id } })}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
