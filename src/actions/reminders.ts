import { db } from '@/db';
import { eventRsvps, events, users } from '@/db/schema';
import { eq, and, sql, lte, gte } from 'drizzle-orm';
import { sendEmail } from '@/lib/nodemailer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createServerFn } from "@tanstack/react-start";
export const processEventRemindersFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    console.log('🕒 Iniciando processamento de lembretes de eventos...');

try {
    // 1. Buscar todos os RSVPs confirmados para eventos que NÃO passaram
    // Vamos buscar eventos que possuem datas futuras e requiresRSVP = true
    const confirmedRsvps = await db
        .select({
            rsvp: eventRsvps,
            event: events,
            user: users,
        })
        .from(eventRsvps)
        .innerJoin(events, eq(eventRsvps.eventId, events.id))
        .innerJoin(users, eq(eventRsvps.userId, users.id))
        .where(
            and(
                eq(eventRsvps.status, 'confirmed'),
                eq(events.requiresRSVP, true)
            )
        );

    let sentCount = 0;
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const record of confirmedRsvps) {
        const { rsvp, event, user } = record;

        // Extrair a data do evento (considerando a primeira data para o lembrete)
        const eventDates = (event.dates as any[]) || [];
        if (eventDates.length === 0) continue;

        const firstDate = new Date(eventDates[0]);
        const diffInMs = firstDate.getTime() - now.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        // Regra 1: Lembrete de 24 horas (exato ou aproximado)
        if (diffInHours <= 24 && diffInHours > 0 && !rsvp.remindersSent?.email1Day) {
            console.log(`📧 Enviando lembrete de 24h para ${user.email} - Evento: ${event.name}`);

            const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                        <h2 style="color: #333;">Lembrete de Evento: ${event.name}</h2>
                        <p>Olá, <strong>${user.firstName || user.name}</strong>!</p>
                        <p>Falta apenas 1 dia para o evento que você confirmou presença.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${format(firstDate, "dd 'de' MMMM", { locale: ptBR })}</p>
                            ${event.startTime ? `<p style="margin: 5px 0;"><strong>⏰ Horário:</strong> ${event.startTime}</p>` : ''}
                            ${event.location ? `<p style="margin: 5px 0;"><strong>📍 Local:</strong> ${event.location}</p>` : ''}
                            ${event.onlineUrl ? `<p style="margin: 5px 0;"><strong>🔗 Link Online:</strong> <a href="${event.onlineUrl}">${event.onlineUrl}</a></p>` : ''}
                        </div>
                        <p>Esperamos você lá!</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">Esta é uma mensagem automática da Comunidade Studio.</p>
                    </div>
                `;

            const success = await sendEmail(
                user.email,
                `Lembrete: O evento "${event.name}" é amanhã!`,
                emailHtml
            );

            if (success) {
                // Atualizar o registro de lembrete enviado
                const updatedReminders = { ...rsvp.remindersSent, email1Day: true };
                await db.update(eventRsvps)
                    .set({ remindersSent: updatedReminders })
                    .where(eq(eventRsvps.id, rsvp.id));
                sentCount++;
            }
        }

        // Regra 2: Lembrete de 1 hora (implementação similar)
        if (diffInHours <= 1 && diffInHours > 0 && !rsvp.remindersSent?.email1Hour) {
            console.log(`📧 Enviando lembrete de 1h para ${user.email} - Evento: ${event.name}`);

            const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                        <h2 style="color: #333;">O evento "${event.name}" começa em 1 hora!</h2>
                        <p>Olá, <strong>${user.firstName || user.name}</strong>!</p>
                        <p>Prepare-se! O evento está prestes a começar.</p>
                        ${event.onlineUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${event.onlineUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                    Acessar agora
                                </a>
                            </div>
                        ` : ''}
                        <p>Nos vemos em breve!</p>
                    </div>
                `;

            const success = await sendEmail(
                user.email,
                `⚠️ Começa em breve: ${event.name}`,
                emailHtml
            );

            if (success) {
                const updatedReminders = { ...rsvp.remindersSent, email1Hour: true };
                await db.update(eventRsvps)
                    .set({ remindersSent: updatedReminders })
                    .where(eq(eventRsvps.id, rsvp.id));
                sentCount++;
            }
        }
    }

    console.log(`✅ Processamento concluído. ${sentCount} lembretes enviados.`);
    return { success: true, sent: sentCount };
} catch (error) {
    console.error('❌ Erro ao processar lembretes:', error);
    return { success: false, error: 'Falha ao processar lembretes' };
}
  });

export const processEventReminders = processEventRemindersFn;
