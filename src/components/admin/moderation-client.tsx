'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { approveUser, rejectUser } from '@/actions/admin';
import { useState } from 'react';
import { useRouter } from "@tanstack/react-router";


import { useTranslation } from 'react-i18next';

export function ModerationList({ users }: { users: any[] }) {
    const { t } = useTranslation('translation', { keyPrefix: 'admin' });
    const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
    const { toast } = useToast();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (user: any) => {
        setProcessingId(user.id);
        try {
            const result = await approveUser({ data: user.id });
            if (result.success) {
                toast({ title: t('toast_user_approved') });
                router.invalidate();
            } else {
                toast({ variant: 'destructive', title: ct('error'), description: result.message || ct('unexpected_error') });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: ct('error'), description: ct('unexpected_error') });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string) => {
        setProcessingId(userId);
        try {
            const result = await rejectUser({ data: userId });
            if (result.success) {
                toast({ title: t('toast_user_rejected') });
                router.invalidate();
            } else {
                toast({ variant: 'destructive', title: ct('error'), description: result.message || ct('unexpected_error') });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: ct('error'), description: ct('unexpected_error') });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{t('moderation_page_title')}</CardTitle>
                <CardDescription>
                    {t('moderation_page_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="hidden md:table-header-group">
                        <TableRow>
                            <TableHead className="w-[100px]">
                                <span className="sr-only">Avatar</span>
                            </TableHead>
                            <TableHead>{ct('name')}</TableHead>
                            <TableHead>{ct('location')}</TableHead>
                            <TableHead>{ct('email')}</TableHead>
                            <TableHead>{ct('bio')}</TableHead>
                            <TableHead>
                                <span className="sr-only">{ct('actions')}</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id} className="flex flex-col md:table-row border-b md:border-b-0 items-start md:items-center">
                                    <TableCell className="block md:table-cell w-full md:w-auto">
                                        <div className="flex items-center gap-3">
                                            <img
                                                alt="Avatar"
                                                className="h-16 w-16 aspect-square rounded-full object-cover"
                                                src={user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`}
                                            />
                                            <div className="md:hidden flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell font-medium">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="block md:table-cell w-full md:w-auto mt-2 md:mt-0">
                                        <span className="md:hidden font-semibold mr-2 text-muted-foreground">{ct('location')}:</span>
                                        {user.city}, {user.country}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                    <TableCell className="block md:table-cell w-full md:w-auto max-w-full md:max-w-xs mt-2 md:mt-0">
                                        <div className="md:hidden font-semibold mb-1 text-muted-foreground">{ct('bio')}:</div>
                                        <div className="md:truncate text-sm text-muted-foreground md:text-foreground">
                                            {user.bio}
                                        </div>
                                    </TableCell>
                                    <TableCell className="block md:table-cell w-full md:w-auto mt-4 md:mt-0">
                                        <div className="flex gap-2 justify-end md:justify-end w-full">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 md:h-8 flex-1 md:flex-none"
                                                onClick={() => handleApprove(user)}
                                                disabled={processingId === user.id}
                                            >
                                                {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2 md:mr-0" />}
                                                <span className="md:sr-only">{ct('approve')}</span>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 md:h-8 flex-1 md:flex-none"
                                                onClick={() => handleReject(user.id)}
                                                disabled={processingId === user.id}
                                            >
                                                {processingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2 md:mr-0" />}
                                                <span className="md:sr-only">{ct('reject')}</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-8">
                                    {t('moderation_empty_list')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
