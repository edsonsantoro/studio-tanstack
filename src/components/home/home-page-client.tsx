'use client';

import { useState, lazy, Suspense } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { UserProfile } from '@/lib/types';
import {
  AlertCircle,
  Users,
  Globe,
  GraduationCap,
  HandHeart,
  Loader2,
} from 'lucide-react';
import { MemberCard } from '@/components/map/member-card';
import { useTranslation } from "react-i18next";

const InteractiveMap = lazy(() => import('@/components/map/interactive-map'));

interface HomePageClientProps {
  users: UserProfile[];
  stats: {
    totalUsers: number;
    totalCountries: number;
  };
  isLoading?: boolean;
  currentUser?: any; // Pass user from server
}

export function HomePageClient({ users, stats, isLoading, currentUser }: HomePageClientProps) {
  const { t: t } = useTranslation('translation', { keyPrefix: 'home' });
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  const handlePinClick = (profile: UserProfile) => {
    setActiveProfile(profile);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-4">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                  {t('title')}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {currentUser ? (
                  <Button asChild size="lg">
                    <Link to="/$locale/dashboard" params={{ locale }} search={{}}>{t('cta_dashboard')}</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link to="/$locale/signup" params={{ locale }} search={{}}>{t('cta_join')}</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/$locale/login" params={{ locale }} search={{}}>{t('cta_login')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Card className="w-full h-[400px] md:h-[500px] p-0 relative overflow-hidden shadow-lg rounded-lg">
              {isLoading ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <>
                <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse rounded-lg" />}>
                  <InteractiveMap
                    pins={users}
                    isMock={true}
                    onPinClick={handlePinClick}
                    onMapClick={() => setActiveProfile(null)}
                  />
                </Suspense>
                  {activeProfile && (
                    <MemberCard
                      profile={activeProfile}
                      isMock={true}
                      onClose={() => setActiveProfile(null)}
                    />
                  )}
                  <div className="absolute bottom-4 left-4 bg-background/80 p-2 rounded-lg border text-sm text-foreground/80 flex items-center gap-2 z-10">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">{t('map_disclaimer_label') || 'Atenção'}:</span> {t('map_disclaimer')}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                {t('features_title')}
              </h2>
              <p className="mx-auto max-w-[700px] text-foreground/70 md:text-xl/relaxed">
                {t('features_subtitle')}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="grid gap-2 text-center">
              <GraduationCap className="mx-auto h-10 w-10 text-primary" />
              <h3 className="text-lg font-bold">{t('feature1_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('feature1_desc')}
              </p>
            </div>
            <div className="grid gap-2 text-center">
              <HandHeart className="mx-auto h-10 w-10 text-primary" />
              <h3 className="text-lg font-bold">{t('feature2_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('feature2_desc')}
              </p>
            </div>
          </div>
        </div>
      </section >

      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              {t('stats_title')}
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/70 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t('stats_subtitle')}
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full">
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-6 shadow-sm">
              <Users className="h-10 w-10 text-primary" />
              <p className="text-4xl font-bold">{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.totalUsers}</p>
              <p className="text-muted-foreground">{t('stats_users')}</p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-6 shadow-sm">
              <Globe className="h-10 w-10 text-primary" />
              <p className="text-4xl font-bold">{isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.totalCountries}</p>
              <p className="text-muted-foreground">{t('stats_countries')}</p>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
}
