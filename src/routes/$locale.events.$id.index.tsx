import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Clock, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { getEvent, getUsers } from '@/actions/events'
import { getRSVPStatus, getEventRSVPs } from '@/actions/rsvp'
import { EventActions } from '@/components/events/event-detail-client'
import { RSVPButton } from '@/components/rsvp-button'
import * as React from 'react'

export const Route = createFileRoute('/$locale/events/$id/')({
  loader: async ({ params, context }) => {
    const { id: eventId } = params
    const { user: session } = context

    const event: any = await getEvent({ data: eventId })

    if (!event) {
      return { event: null, attendees: [], rsvpStatus: null, rsvpStats: null, session }
    }

    // Fetch attendees
    const attendeeIds = (event.attendeeIds as string[]) || []
    const attendees = attendeeIds.length > 0 ? await getUsers({ data: attendeeIds }) : []

    // Fetch RSVP data if event requires RSVP
    let rsvpStatus = null
    let rsvpStats: any = { total: 0, confirmed: 0, declined: 0, maybe: 0, rsvps: [] }

    if (event.requiresRSVP) {
      if (session?.id) {
        rsvpStatus = await getRSVPStatus({ data: { eventId, userId: session.id } })
      }
      rsvpStats = await getEventRSVPs({ data: eventId })
    }

    return { event, attendees, rsvpStatus, rsvpStats, session }
  },
  component: EventDetailPage,
})

function EventDetailPage() {
  const { event, attendees, rsvpStatus, rsvpStats, session } = Route.useLoaderData()
  const { locale } = Route.useParams()

  if (!event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold">Evento não encontrado</h2>
        <p className="text-muted-foreground">O evento que você está procurando não existe ou foi removido.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/$locale/events" params={{ locale }}>Voltar para Eventos</Link>
        </Button>
      </div>
    )
  }

  const attendeeIds = (event.attendeeIds as string[]) || []

  // Normalize dates
  const sortedDates = (event.dates || []).map((d: any) => {
    return new Date(d)
  }).sort((a: Date, b: Date) => a.getTime() - b.getTime())

  const isPastEvent = sortedDates.length > 0 && sortedDates[sortedDates.length - 1] < new Date()

  return (
    <TooltipProvider>
      <div>
        <div className="relative h-[50vh] w-full">
          <img
            src={event.imageUrl || 'https://picsum.photos/seed/event-placeholder/1200/400'}
            alt={`Imagem para ${event.name}`}
            className="absolute inset-0 w-full h-full object-cover bg-muted"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container text-center text-white">
              <h1 className="text-5xl font-bold font-headline">{event.name}</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Sobre o Evento</h2>
                <p className="text-lg text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>

              {isPastEvent && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-headline">O que aconteceu</h2>
                  </div>

                  {(event.postEventDescription || (event.postEventImageUrls && event.postEventImageUrls.length > 0)) ? (
                    <div className="space-y-6">
                      {event.postEventDescription && (
                        <p className="text-lg text-muted-foreground whitespace-pre-wrap">{event.postEventDescription}</p>
                      )}
                      {event.postEventImageUrls && event.postEventImageUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {event.postEventImageUrls.map((url: string, index: number) => (
                            <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                              <img
                                src={url}
                                alt={`Foto do evento ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover bg-muted"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                      <p>Nenhum relato ou foto adicionado ainda.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-6">

              <EventActions event={event} isPastEvent={isPastEvent} user={session} />

              {/* RSVP Button - Only show if event requires RSVP and user is logged in */}
              {event.requiresRSVP && !isPastEvent && session?.id && (
                <div className="p-4 border rounded-lg bg-muted/10">
                  <h3 className="font-semibold mb-3">Confirmação de Presença</h3>
                  <RSVPButton
                    eventId={event.id}
                    userId={session.id}
                    initialStatus={rsvpStatus as any}
                    confirmedCount={rsvpStats.confirmed}
                  />
                </div>
              )}

              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Quando</h3>
                    <ul className="text-muted-foreground list-disc pl-5">
                      {sortedDates.slice(0, 5).map((date: Date, index: number) => (
                        <li key={index}>
                          <span className="capitalize">{format(date, "eeee, dd 'de' MMMM", { locale: ptBR })}</span>
                        </li>
                      ))}
                    </ul>
                    {sortedDates.length > 5 && <p className="text-sm text-muted-foreground mt-1">e mais {sortedDates.length - 5} data(s)...</p>}
                  </div>
                </div>

                {event.startTime && (
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Horário</h3>
                      <p className="text-muted-foreground">{event.startTime} (duração de {event.durationHours || 'N/A'}h)</p>
                    </div>
                  </div>
                )}

                {event.recurrenceDescription && (
                  <div className="flex items-start gap-4">
                    <Repeat className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Recorrência</h3>
                      <p className="text-muted-foreground">{event.recurrenceDescription}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Onde</h3>
                    <div className="space-y-2">
                      {event.location && (
                        <p className="text-muted-foreground">📍 {event.location}</p>
                      )}
                      {event.isOnline && event.onlineUrl && (
                        <a
                          href={event.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline block"
                        >
                          🔗 Link da Transmissão Online
                        </a>
                      )}
                      {!event.location && !event.isOnline && (
                        <p className="text-muted-foreground">Local a definir</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Participantes</h3>
                    <p className="text-muted-foreground">{attendeeIds.length} pessoa(s) confirmada(s)</p>
                    {attendees.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {attendees.map((attendee: any) => (
                          <Tooltip key={attendee.id}>
                            <TooltipTrigger>
                              <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={attendee.profilePictureUrl || `https://avatar.vercel.sh/${attendee.id}.png`} alt={`${attendee.firstName}`} />
                                <AvatarFallback>{(attendee.firstName || attendee.name || '?')[0]}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{attendee.name || attendee.firstName || 'Usuário'}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Organizado por:</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.organizerAvatar || `https://avatar.vercel.sh/${event.organizerId}.png`} alt={event.organizerName || 'Organizador'} />
                    <AvatarFallback>{(event.organizerName || '?').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground">{event.organizerName || 'Membro da Comunidade'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
