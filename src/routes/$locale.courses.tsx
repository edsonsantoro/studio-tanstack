import { createFileRoute } from '@tanstack/react-router'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { getHotmartProducts } from '@/lib/hotmart'
import { CourseCard } from '@/components/courses/course-card'
import { CoursesGrid } from '@/components/courses/courses-grid'
import { useTranslation } from 'react-i18next'
import * as React from 'react'

export const Route = createFileRoute('/$locale/courses')({
  loader: async ({ params }) => {
    const { locale } = params
    const products = await getHotmartProducts(false, locale)
    return { products }
  },
  component: CoursesPage,
})

function CoursesPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'courses' })
  const { products } = Route.useLoaderData()
  const heroImage = PlaceHolderImages.find(p => p.id === 'courses-hero')
  const hasProducts = products && products.length > 0
  const featured = React.useMemo(() => 
    hasProducts ? [...products].sort(() => 0.5 - Math.random()).slice(0, 3) : [],
    [products, hasProducts]
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center text-white">
        {heroImage && (
          <img
            src={heroImage.imageUrl}
            alt={t('page_title')}
            className="absolute inset-0 z-0 object-cover w-full h-full"
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 container px-4 md:px-6 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            {t('page_title')}
          </h1>
          <p className="max-w-[700px] mx-auto text-lg md:text-xl mt-4">
            {t('page_subtitle')}
          </p>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="featured-courses" className="w-full py-12 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline mb-4">{t('featured_title')}</h2>
            <p className="text-muted-foreground">{t('featured_subtitle')}</p>
          </div>
          {hasProducts ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.map(course => (
                <CourseCard key={`featured-${course.id}`} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-lg border border-dashed">
              <p className="text-muted-foreground">{t('load_error')}</p>
              <p className="text-xs text-muted-foreground mt-2">{t('load_error_hint')}</p>
            </div>
          )}
        </div>
      </section>

      {/* All Courses Section */}
      <section id="courses" className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              {t('all_courses_title')}
            </h2>
            <p className="max-w-[900px] text-foreground/70 md:text-xl/relaxed">
              {t('all_courses_desc')}
            </p>
          </div>
          {hasProducts ? (
            <CoursesGrid initialProducts={products} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('no_courses_found')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
