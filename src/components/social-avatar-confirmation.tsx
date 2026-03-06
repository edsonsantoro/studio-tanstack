'use client';

import * as React from 'react';
import { useSearch, useRouter, useLocation, useNavigate } from '@tanstack/react-router';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { updateAvatarFromSocial } from '@/actions/profile';
import { useTranslation } from "react-i18next";

export function SocialAvatarConfirmation() {
    const searchParams = useSearch({ from: '__root__' }) as any;
    const router = useRouter();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { t: t } = useTranslation('translation', { keyPrefix: 'social_avatar_confirmation' });

    // Check if we need to show the confirmation
    const action = searchParams.action;
    const provider = searchParams.provider;
    const showConfirmation = action === 'confirm_social_avatar' && (provider === 'google' || provider === 'facebook' || provider === 'twitter');

    const [open, setOpen] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    React.useEffect(() => {
        if (showConfirmation) {
            setOpen(true);
        }
    }, [showConfirmation]);

    const handleConfirm = async () => {
        if (!provider) return;
        setIsUpdating(true);
        try {
            const result = await updateAvatarFromSocial({ data: provider as 'google' | 'facebook' | 'twitter' });
            if (result.success) {
                toast({
                    title: t('toast_success_title'),
                    description: t('toast_success_desc'),
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: t('toast_error_title'),
                    description: t('toast_error_desc'),
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('toast_error_title'),
                description: t('toast_error_desc'),
            });
        } finally {
            setIsUpdating(false);
            setOpen(false);
            cleanupParams();
        }
    };

    const handleCancel = () => {
        toast({
            title: t('toast_cancel_title'),
            description: t('toast_cancel_desc'),
        });
        setOpen(false);
        cleanupParams();
    };

    const cleanupParams = () => {
        navigate({ 
            search: {} as any,
            replace: true 
        });
    };

    if (!showConfirmation) return null;

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('title', { provider: provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'X (Twitter)' })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('description', { provider: provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'X (Twitter)' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={isUpdating}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirm(); }} disabled={isUpdating}>
                        {isUpdating ? t('updating') : t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
