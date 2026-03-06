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
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { allTags } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LocationSearch } from '@/components/location-search';
import { useRouter, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { editMemberFormSchema } from '@/lib/schemas';
import { updateUserAction } from '@/actions/admin';

const clientEditSchema = editMemberFormSchema.extend({
    email: z.string().email('Email inválido.').optional(),
});

type FormValues = z.infer<typeof clientEditSchema>;

interface EditUserFormProps {
    user: any; // Type accurately if possible
    userId: string;
}

export function EditUserForm({ user, userId }: EditUserFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const navigate = useNavigate();;
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(clientEditSchema),
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            city: user.city || '',
            country: user.country || '',
            latitude: user.coords?.lat,
            longitude: user.coords?.lng,
            bio: user.bio || '',
            tags: user.tags || [],
            whatsAppNumber: user.whatsAppLink ? user.whatsAppLink.replace('https://wa.me/', '') : '',
            instagramUsername: user.instagramLink ? user.instagramLink.replace('https://instagram.com/', '') : '',
            blogLink: user.blogLink || '',
            websiteLink: user.websiteLink || '',
            role: user.role || 'user',
            isApproved: user.isApproved || false,
            isTraveler: user.isTraveler || false,
            visibility: user.isLocationPublic ? 'public' : 'hidden', // Approximate mapping
            languages: (user.languages || []).join(', '),
            visibilitySettings: { // Mock defaults as schema requires them but we don't store them yet
                showProfilePicture: true,
                showBio: true,
                showLanguages: true,
                showWhatsAppLink: true,
                showInstagramLink: true,
                showBlogLink: true,
                showWebsiteLink: true,
            }
        },
    });

    const handleLocationSelect = (location: { name: string; country: string; lat: number; lng: number; }) => {
        form.setValue("city", location.name);
        form.setValue("country", location.country);
        form.setValue("latitude", location.lat);
        form.setValue("longitude", location.lng);
        form.clearErrors("city");
    };

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        try {
            const result = await updateUserAction({ data: userId });

            if (result.success) {
                toast({
                    title: 'Perfil Atualizado!',
                    description: `As informações de ${data.firstName} foram salvas.`,
                });
                navigate({ to: '/admin/users' as any });
                router.invalidate();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Erro',
                    description: result.message || 'Erro ao atualizar.',
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar perfil",
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-4 md:p-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Editar Membro: {user.firstName}</CardTitle>
                            <CardDescription>
                                Ajuste os dados do perfil do usuário. O e-mail não pode ser alterado aqui.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl><Input placeholder="João" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sobrenome</FormLabel>
                                        <FormControl><Input placeholder="Silva" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" {...field} disabled /></FormControl>
                                    <FormDescription>O e-mail é usado para login e não pode ser alterado.</FormDescription>
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="city" render={() => (
                                <FormItem>
                                    <FormLabel>Localização (Cidade e País)</FormLabel>
                                    <FormControl><LocationSearch onLocationSelect={handleLocationSelect} initialValue={form.getValues('city') ? `${form.getValues('city')}, ${form.getValues('country')}` : ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="bio" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio Curta</FormLabel>
                                    <FormControl><Textarea placeholder="Conte um pouco sobre o membro..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="languages" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Idiomas</FormLabel>
                                    <FormControl><Input placeholder="Português, Inglês, Espanhol" {...field} /></FormControl>
                                    <FormDescription>Separe os idiomas por vírgula.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="tags" render={() => (
                                <FormItem>
                                    <FormLabel>Tags de Interesse</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4">
                                        {allTags.map((tag) => (
                                            <FormField key={tag} control={form.control} name="tags" render={({ field }) => (
                                                <FormItem key={tag} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(tag)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), tag])
                                                                    : field.onChange(field.value?.filter((value) => value !== tag));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{tag}</FormLabel>
                                                </FormItem>
                                            )} />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div>
                                <h3 className="text-lg font-medium mb-4">Links e Contatos</h3>
                                <div className="space-y-4">
                                    <FormField control={form.control} name="whatsAppNumber" render={({ field }) => (
                                        <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="5511999999999" {...field} /></FormControl><FormDescription>Apenas números, incluindo código do país.</FormDescription><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="instagramUsername" render={({ field }) => (
                                        <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="usuario.do.insta" {...field} /></FormControl><FormDescription>Apenas o nome de usuário.</FormDescription><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="blogLink" render={({ field }) => (
                                        <FormItem><FormLabel>Blog</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="websiteLink" render={({ field }) => (
                                        <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-4">Configurações de Admin e Perfil</h3>
                                <div className="space-y-4 rounded-lg border p-4">
                                    <FormField control={form.control} name="role" render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Função (Role)</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="user" /></FormControl><FormLabel className="font-normal">Usuário</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="admin" /></FormControl><FormLabel className="font-normal">Admin</FormLabel></FormItem>
                                        </RadioGroup></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="isApproved" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between"><div className="space-y-0.5"><FormLabel>Aprovar Perfil</FormLabel><FormDescription>Se ativado, o perfil ficará visível publicamente.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="isTraveler" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between"><div className="space-y-0.5"><FormLabel>É Viajante/Missionário</FormLabel><FormDescription>Marque se o usuário está atualmente viajando.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="visibility" render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Visibilidade do Perfil</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="public" /></FormControl><FormLabel className="font-normal">Público</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="hidden" /></FormControl><FormLabel className="font-normal">Oculto</FormLabel></FormItem>
                                        </RadioGroup></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/users' as any })}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
