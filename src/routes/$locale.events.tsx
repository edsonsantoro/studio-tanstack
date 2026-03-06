import { createFileRoute, Link } from '@tanstack/react-router'
import { getPublicEvents } from '@/actions/events'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { EventCard } from '@/components/events/event-card'
import { useTranslation } from 'react-i18next'
import * as React from 'react'

export const Route = createFileRoute('/$locale/events')({
  loader: async () => {
    const events = await getPublicEvents()
    return { events }
  },
  component: EventsPage,
})

function EventsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'events' })
  const { events } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const { locale } = Route.useParams()

  const now = new Date()
  const upcomingEvents: any[] = []
  const pastEvents: any[] = []

  if (events) {
    events.forEach((event: any) => {
      const dateStrings = (event.dates as string[] || [])
      if (dateStrings.length === 0) {
        upcomingEvents.push(event)
        return
      }

      const eventDates = dateStrings.map(d => new Date(d))
      eventDates.sort((a, b) => a.getTime() - b.getTime())
      const lastDate = new Date(eventDates[eventDates.length - 1])
      lastDate.setHours(23, 59, 59, 999)

      if (lastDate < now) {
        pastEvents.push(event)
      } else {
        upcomingEvents.push(event)
      }
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">{t('page_title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('page_subtitle')}</p>
        </div>
        {user && (
          <Button asChild size="lg">
            <Link to="/$locale/events/create" params={{ locale }}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('create_event')}
            </Link>
          </Button>
        )}
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">{t('no_events_title')}</h3>
          <p className="text-muted-foreground mt-2">{t('no_events_desc')}</p>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="pt-8 border-t">
          <h2 className="text-2xl font-bold font-headline mb-6 opacity-70">Eventos Passados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
