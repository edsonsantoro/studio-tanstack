import { db } from '@/db'
import { events, users } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { getUser } from '@/lib/auth'

export const getPublicEventsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const publicEvents = await db
        .select({
          id: events.id,
          name: events.name,
          description: events.description,
          location: events.location,
          isOnline: events.isOnline,
          isPublic: events.isPublic,
          dates: events.dates,
          imageUrl: events.imageUrl,
          attendeeIds: events.attendeeIds,
          organizerId: events.organizerId,
          coords: events.coords,
          createdAt: events.createdAt,
          startTime: events.startTime,
          durationHours: events.durationHours,
          recurrenceDescription: events.recurrenceDescription,
          postEventDescription: events.postEventDescription,
          postEventImageUrls: events.postEventImageUrls,
        })
        .from(events)
        .where(eq(events.isPublic, true))
        .orderBy(desc(events.createdAt))

      if (!publicEvents.length) {
        return []
      }

      const organizerIds = [
        ...new Set(
          publicEvents.map((e) => e.organizerId).filter(Boolean) as string[],
        ),
      ]

      let organizerMap = new Map()

      if (organizerIds.length > 0) {
        try {
          const organizers = await db
            .select({
              id: users.id,
              name: users.name,
              profilePictureUrl: users.profilePictureUrl,
            })
            .from(users)
            .where(inArray(users.id, organizerIds))

          organizerMap = new Map(organizers.map((o) => [o.id, o]))
        } catch (userError) {
          console.error('Failed to fetch organizers:', userError)
        }
      }

      const results = publicEvents.map((event) => {
        const organizer = event.organizerId
          ? organizerMap.get(event.organizerId)
          : null
        return {
          ...event,
          organizerName: organizer?.name || 'Organizador',
          organizerAvatar: organizer?.profilePictureUrl || null,
        }
      })

      return results
    } catch (error: any) {
      console.error('Failed to fetch public events', error)
      throw new Error('Failed to fetch events.')
    }
  },
)

export const createEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => data)
  .handler(async ({ data: eventData }) => {
    try {
      const newEventId = crypto.randomUUID()
      await db.insert(events).values({
        ...eventData,
        id: newEventId,
        createdAt: new Date(),
      })
      return { success: true, data: { id: newEventId } }
    } catch (error: any) {
      console.error('Failed to create event', error)
      throw new Error(error.message || 'Erro ao criar evento.')
    }
  })

export const updateEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { eventId: string; eventData: any }) => data)
  .handler(async ({ data }) => {
    const { eventId, eventData } = data
    try {
      const session = await getUser()
      if (!session) throw new Error('Unauthorized')

      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1)
      if (!event.length) throw new Error('Evento não encontrado')

      if (event[0].organizerId !== session.userId && session.role !== 'admin') {
        throw new Error('Sem permissão')
      }

      await db.update(events).set(eventData).where(eq(events.id, eventId))
      return { success: true }
    } catch (error: any) {
      console.error('Failed to update event', error)
      throw new Error('Falha na atualização do evento.')
    }
  })

export const toggleRSVPFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { eventId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    const { eventId, userId } = data
    try {
      const event = await db
        .select({ attendeeIds: events.attendeeIds })
        .from(events)
        .where(eq(events.id, eventId))
      if (!event.length) throw new Error('Evento não encontrado.')

      let attendees = (event[0].attendeeIds || []) as string[]
      const isAttending = attendees.includes(userId)

      if (isAttending) {
        attendees = attendees.filter((id) => id !== userId)
      } else {
        attendees.push(userId)
      }

      await db
        .update(events)
        .set({ attendeeIds: attendees })
        .where(eq(events.id, eventId))

      return { success: true, isAttending: !isAttending }
    } catch (error) {
      console.error('Failed to toggle RSVP', error)
      throw new Error('Erro ao atualizar presença.')
    }
  })

export const getEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    try {
      const eventResult = await db.select().from(events).where(eq(events.id, id)).limit(1)
      if (eventResult.length === 0) return null
      
      const event = eventResult[0]
      const organizerResult = await db.select({
        name: users.name,
        profilePictureUrl: users.profilePictureUrl
      }).from(users).where(eq(users.id, event.organizerId || '')).limit(1)
      
      const organizer = organizerResult[0]
      
      return {
        ...event,
        organizerName: organizer?.name || 'Organizador',
        organizerAvatar: organizer?.profilePictureUrl || null,
      }
    } catch (error) {
      console.error('Failed to get event:', error)
      return null
    }
  })

export const getUsersFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string[]) => data)
  .handler(async ({ data: ids }) => {
    if (ids.length === 0) return []
    try {
      return await db.select({
        id: users.id,
        name: users.name,
        firstName: users.firstName,
        profilePictureUrl: users.profilePictureUrl
      }).from(users).where(inArray(users.id, ids))
    } catch (error) {
      console.error('Failed to get users:', error)
      return []
    }
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: id }) => {
    try {
      const session = await getUser()
      if (!session) throw new Error('Unauthorized')

      const eventResult = await db.select().from(events).where(eq(events.id, id)).limit(1)
      if (eventResult.length === 0) throw new Error('Event not found')
      
      if (eventResult[0].organizerId !== session.userId && session.role !== 'admin') {
        throw new Error('Forbidden')
      }

      await db.delete(events).where(eq(events.id, id))
      return { success: true }
    } catch (error: any) {
      console.error('Failed to delete event:', error)
      return { success: false, error: error.message }
    }
  })

// Alias para compatibilidade
export const getPublicEvents = getPublicEventsFn
export const getEvent = getEventFn
export const getUsers = getUsersFn
export const createEvent = createEventFn
export const updateEvent = updateEventFn
export const deleteEvent = deleteEventFn
export const toggleRSVP = toggleRSVPFn
