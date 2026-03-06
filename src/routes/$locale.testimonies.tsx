import { createFileRoute, Link } from '@tanstack/react-router'
import { getPublicTestimonies } from '@/actions/testimonies'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { TestimonyCard } from '@/components/testimonies/testimony-card'
import { useTranslation } from 'react-i18next'
import * as React from 'react'

export const Route = createFileRoute('/$locale/testimonies')({
  loader: async () => {
    const testimonies = await getPublicTestimonies()
    return { testimonies }
  },
  component: TestimoniesPage,
})

function TestimoniesPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'testimonies' })
  const { testimonies } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const { locale } = Route.useParams()

  return (
    <div className="container mx-auto py-10 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">{t('page_title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('page_subtitle')}</p>
        </div>
        {user && (
          <Button asChild size="lg">
            <Link to="/$locale/testimonies/create" params={{ locale }}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('create_button')}
            </Link>
          </Button>
        )}
      </div>

      {testimonies && testimonies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonies.map(testimony => <TestimonyCard key={testimony.id} testimony={testimony} />)}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">{t('no_testimonies_title')}</h3>
          <p className="text-muted-foreground mt-2">{t('no_testimonies_desc')}</p>
        </div>
      )}
    </div>
  )
}
