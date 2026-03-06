'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MemberCard } from '@/components/map/member-card';
import type { Event, Tag } from '@/lib/types';
import { allTags, tagToKey } from '@/lib/types';
import { Locate, Search, UserCheck, CheckCircle, XCircle, Copy, Gift } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { EventCard } from '@/components/map/event-card';
import { approveRequest, rejectRequest } from '@/actions/verification';
import { useRouter } from '@tanstack/react-router';
import { UserRecommendationAlert } from './user-recommendation-alert';
import { cn } from '@/lib/utils';

const InteractiveMap = lazy(() => import('@/components/map/interactive-map'));

interface DashboardClientProps {
    users: any[];
    events: any[];
    currentUser?: any;
    requests?: any[];
}

// Helper for distance (Haversine)
function getDistance(coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }) {
    if (!coords1 || !coords2) return Infinity;
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

import { useTranslation } from "react-i18next";

export function DashboardClient({ users, events, currentUser, requests = [] }: DashboardClientProps) {
    const { t: t } = useTranslation('translation', { keyPrefix: 'dashboard' });
    const { t: ct } = useTranslation('translation', { keyPrefix: 'common' });
    const { toast } = useToast();
    const router = useRouter();
    const [activeItem, setActiveItem] = useState<any | null>(null);

    // Filters
    const [distance, setDistance] = useState([100]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('todos');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPins, setFilteredPins] = useState<any[]>([]);
    const [countries, setCountries] = useState<string[]>([]);

    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    const upcomingEvents = useMemo(() => {
        if (!events) return [];
        const now = new Date();
        return events.filter(event => {
            if (!event.dates || !Array.isArray(event.dates)) return false;
            return event.dates.some((d: any) => new Date(d) >= now);
        });
    }, [events]);

    const allPins = useMemo(() => {
        // If user is not approved, only show their own pin
        let usersToShow = users || [];
        if (currentUser && !currentUser.isApproved) {
            usersToShow = users.filter(user => user.id === currentUser.id);
        }

        const userPins = usersToShow.map(user => ({
            ...user,
            type: 'user',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name,
            avatarUrl: user.profilePictureUrl || `https://avatar.vercel.sh/${user.id}.png`,
            tags: user.tags || [],
            imageHint: 'avatar portrait'
        }));

        const eventPins = (upcomingEvents || []).map(event => ({
            ...event,
            type: 'event',
        }));

        return [...userPins, ...eventPins].filter(pin => pin.coords);
    }, [users, upcomingEvents, currentUser]);

    useEffect(() => {
        if (allPins.length > 0) {
            const pinCountries = [...new Set(allPins.map(pin => pin.country).filter(Boolean))].sort();
            setCountries(pinCountries);
        }
    }, [allPins]);

    useEffect(() => {
        let pins = allPins;
        if (searchQuery) {
            pins = pins.filter(pin =>
                (pin.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (pin.city || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCountry !== 'todos') {
            pins = pins.filter(pin => pin.country === selectedCountry);
        }
        if (selectedTags.length > 0) {
            pins = pins.filter(pin =>
                pin.type === 'user' && (pin.tags || []).some((tag: Tag) => selectedTags.includes(tag))
            );
        }
        if (userLocation) {
            pins = pins.filter(pin => {
                if (!pin.coords) return false;
                const dist = getDistance(userLocation, pin.coords);
                return dist <= distance[0];
            });
        }
        setFilteredPins(pins);
    }, [allPins, selectedTags, selectedCountry, distance, userLocation, searchQuery]);

    const handlePinClick = (item: any) => setActiveItem(item);

    const handleFindNearMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    toast({ title: t('find_me_success_toast') || "Localização encontrada!", description: t('find_me_success_toast_desc') || "O filtro de proximidade está ativo." });
                },
                (error) => toast({ variant: "destructive", title: ct('error'), description: ct('unexpected_error') })
            );
        } else {
            toast({ variant: "destructive", title: ct('error'), description: "Geolocalização não suportada." });
        }
    };

    const handleTagChange = (tag: string, checked: boolean) => {
        setSelectedTags(prev => checked ? [...prev, tag] : prev.filter(t => t !== tag));
    };

    const handleClearFilters = () => {
        setDistance([100]);
        setSelectedTags([]);
        setSelectedCountry('todos');
        setUserLocation(null);
        setSearchQuery('');
        toast({ title: t('filter_clear_toast') || "Filtros Limpos" });
    };

    const copyInviteLink = () => {
        if (!currentUser?.inviteCode) {
            toast({ variant: 'destructive', title: ct('error'), description: "Invite code not ready. Please refresh." });
            return;
        }
        const link = `${window.location.origin}/signup?invite=${currentUser.inviteCode}`;
        navigator.clipboard.writeText(link);
        toast({ title: t('invite_box_toast_title'), description: t('invite_box_toast_desc') });
    };

    const handleApprove = async (reqId: string, reqUserId: string) => {
        setProcessingRequest(reqId);
        const res = await approveRequest({ data: { requestId: reqId, requesterId: reqUserId } });
        if (res.success) {
            toast({ title: t('pending_requests_approve_toast'), description: t('pending_requests_approve_toast_desc') });
            router.invalidate();
        } else {
            toast({ variant: "destructive", title: ct('error'), description: (res as any).error || ct('unexpected_error') });
        }
        setProcessingRequest(null);
    }

    const handleReject = async (reqId: string) => {
        setProcessingRequest(reqId);
        const res = await rejectRequest({ data: reqId });
        if (res.success) {
            toast({ title: t('pending_requests_reject_toast'), description: t('pending_requests_reject_toast_desc') });
            router.invalidate();
        } else {
            toast({ variant: "destructive", title: ct('error'), description: ct('unexpected_error') });
        }
        setProcessingRequest(null);
    }


    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" variant="sidebar" className="border-r">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>{ct('filters')}</SidebarGroupLabel>
                        <div className="flex flex-col gap-6 p-2">
                            {/* Only show Invite Box if user is approved */}
                            {currentUser?.isApproved && (
                                <Card className="bg-primary/5 border-primary/20 shadow-none">
                                    <CardHeader className="p-3 pb-0">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Gift className="h-4 w-4 text-primary" />
                                            {t('invite_box_title')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-muted-foreground mb-3">
                                            {t('invite_box_desc')}
                                        </p>
                                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={copyInviteLink}>
                                            <Copy className="mr-2 h-3 w-3" />
                                            {t('invite_box_button')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            <div>
                                <Label htmlFor="distance" className="mb-2 block">
                                    {t('filter_proximity', { distance: distance[0] })}
                                    {!userLocation && <span className="text-xs text-muted-foreground"> {t('filter_proximity_activate')}</span>}
                                </Label>
                                <Slider id="distance" min={1} max={500} step={1} value={distance} onValueChange={setDistance} disabled={!userLocation} />
                            </div>

                            <div>
                                <Label className="mb-2 block">{ct('tags')}</Label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {allTags.map(tag => (
                                        <div key={tag} className="flex items-center space-x-2">
                                            <Checkbox id={tag} checked={selectedTags.includes(tag)} onCheckedChange={(c) => handleTagChange(tag, c as boolean)} />
                                            <Label htmlFor={tag} className="font-normal text-sm">{t(`tags.${tagToKey[tag] || tag}`, tag)}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">{t('filter_country')}</Label>
                                <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                                    <SelectTrigger><SelectValue placeholder={ct('select')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">{t('filter_country_all')}</SelectItem>
                                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="ghost" onClick={handleClearFilters}>{t('filter_clear')}</Button>
                        </div>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-col h-full">
                    {/* Pending Requests Alert Area */}
                    {requests.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 p-4">
                            <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <p className="font-semibold text-amber-900 dark:text-amber-100">
                                            {t('pending_requests_title', { count: requests.length })}
                                        </p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            {t('pending_requests_desc')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {requests.map(req => (
                                        <div key={req.id} className="flex items-center gap-2 bg-white dark:bg-black/20 p-2 rounded-md border border-amber-200 dark:border-amber-800">
                                            <span className="text-sm font-medium px-1">{req.requesterName}</span>
                                            <Button
                                                size="sm"
                                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleApprove(req.id, req.requesterId)}
                                                disabled={!!processingRequest}
                                            >
                                                {processingRequest === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                                <span className="sr-only">{ct('approve')}</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 px-2 text-red-600 hover:bg-red-50 border-red-200"
                                                onClick={() => handleReject(req.id)}
                                                disabled={!!processingRequest}
                                            >
                                                {processingRequest === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                                <span className="sr-only">{ct('reject')}</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!currentUser?.isApproved && (
                        <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800 p-3 text-center text-sm text-amber-900 dark:text-amber-200">
                            <strong>{t('awaiting_approval_banner')}</strong>
                            <br />
                            <span className="text-xs">{t('awaiting_approval_banner_hint')}</span>
                        </div>
                    )}

                    <header className="sticky top-0 z-10 border-b bg-background">
                        <div className="container flex h-[57px] items-center gap-2">
                            <h1 className="text-xl font-semibold font-headline">{t('title')}</h1>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('search_placeholder')}
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    variant={userLocation ? "default" : "outline"} 
                                    size="icon" 
                                    onClick={handleFindNearMe}
                                    className={cn(!userLocation && "animate-pulse border-primary text-primary shadow-sm shadow-primary/20")}
                                >
                                    <Locate className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1">
                        <div className="container p-4">
                            <UserRecommendationAlert />
                            <Card className="w-full h-[500px] md:h-full p-0 relative overflow-hidden shadow-lg rounded-lg">
                                <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-lg" />}>
                                    <InteractiveMap
                                        pins={filteredPins}
                                        onPinClick={handlePinClick}
                                        onMapClick={() => setActiveItem(null)}
                                    />
                                </Suspense>
                                {activeItem?.type === 'user' && <MemberCard profile={activeItem} onClose={() => setActiveItem(null)} />}
                                {activeItem?.type === 'event' && <EventCard event={activeItem} onClose={() => setActiveItem(null)} />}
                            </Card>
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
