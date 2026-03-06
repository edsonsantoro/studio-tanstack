import { db } from '@/db';
import { eventRsvps, events, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail } from '@/lib/nodemailer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createServerFn } from "@tanstack/react-start";
export const confirmRSVPFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { eventId: string, userId: string, status: 'confirmed' | 'declined' | 'maybe' }) => data)
  .handler(async ({ data }) => {
    const { eventId, userId, status } = data;
try {
    // Buscar dados do evento e usuário para o e-mail ANTES de atualizar
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    // Verificar se já existe um RSVP
    const existingRsvp = await db
        .select()
        .from(eventRsvps)
        .where(and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.userId, userId)
        ))
        .limit(1);

    if (existingRsvp.length > 0) {
        // Atualizar RSVP existente
        await db
            .update(eventRsvps)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(eventRsvps.id, existingRsvp[0].id));
    } else {
        // Criar novo RSVP
        await db.insert(eventRsvps).values({
            eventId,
            userId,
            status,
            confirmedAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Se confirmou presença, enviar e-mail de confirmação
    if (status === 'confirmed' && event[0] && user[0]) {
        const ev = event[0];
        const us = user[0];
        const eventDate = ev.dates && (ev.dates as any[]).length > 0 ? new Date(ev.dates[0]) : null;

        const emailHtml = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2e7d32;">Presença Confirmada! ✅</h2>
                    <p>Olá, <strong>${us.firstName || us.name}</strong>!</p>
                    <p>Sua presença no evento <strong>"${ev.name}"</strong> foi confirmada com sucesso.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        ${eventDate ? `<p>📅 <strong>Data:</strong> ${format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>` : ''}
                        ${ev.startTime ? `<p>⏰ <strong>Horário:</strong> ${ev.startTime}</p>` : ''}
                        ${ev.location ? `<p>📍 <strong>Local:</strong> ${ev.location}</p>` : ''}
                        ${ev.onlineUrl ? `<p>🔗 <strong>Link:</strong> <a href="${ev.onlineUrl}">${ev.onlineUrl}</a></p>` : ''}
                    </div>
                    <p>Enviaremos lembretes por e-mail quando o evento estiver próximo.</p>
                    <p>Nos vemos lá!</p>
                </div>
            `;

        await sendEmail(
            us.email,
            `Inscrição Confirmada: ${ev.name}`,
            emailHtml
        );
    }

    
    

    return { success: true, message: 'Presença registrada!' };
} catch (error) {
    console.error('Error confirming RSVP:', error);
    return { success: false, message: 'Erro ao confirmar presença.' };
}
  });

export const confirmRSVP = confirmRSVPFn;
export const cancelRSVPFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { eventId: string, userId: string }) => data)
  .handler(async ({ data }) => {
    const { eventId, userId } = data;
try {
    await db
        .delete(eventRsvps)
        .where(and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.userId, userId)
        ));

    
    

    return { success: true, message: 'Presença cancelada.' };
} catch (error) {
    console.error('Error canceling RSVP:', error);
    return { success: false, message: 'Erro ao cancelar presença.' };
}
  });

export const cancelRSVP = cancelRSVPFn;
export const getRSVPStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { eventId: string, userId: string }) => data)
  .handler(async ({ data }) => {
    const { eventId, userId } = data;
try {
    const rsvp = await db
        .select()
        .from(eventRsvps)
        .where(and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.userId, userId)
        ))
        .limit(1);

    return rsvp.length > 0 ? rsvp[0].status : null;
} catch (error) {
    console.error('Error getting RSVP status:', error);
    return null;
}
  });

export const getRSVPStatus = getRSVPStatusFn;
export const getEventRSVPsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: eventId }) => {
    try {
    const rsvps = await db
        .select()
        .from(eventRsvps)
        .where(eq(eventRsvps.eventId, eventId));

    return {
        total: rsvps.length,
        confirmed: rsvps.filter(r => r.status === 'confirmed').length,
        declined: rsvps.filter(r => r.status === 'declined').length,
        maybe: rsvps.filter(r => r.status === 'maybe').length,
        rsvps,
    };
} catch (error) {
    console.error('Error getting event RSVPs:', error);
    return {
        total: 0,
        confirmed: 0,
        declined: 0,
        maybe: 0,
        rsvps: [],
    };
}
  });

export const getEventRSVPs = getEventRSVPsFn;
