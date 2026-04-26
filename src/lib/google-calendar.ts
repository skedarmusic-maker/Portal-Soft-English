import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { data: tokens } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (!tokens) return null;

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  // Listener para salvar novos tokens caso ocorra um refresh automático
  oauth2Client.on('tokens', async (newTokens) => {
    const updateData: any = { access_token: newTokens.access_token };
    if (newTokens.refresh_token) updateData.refresh_token = newTokens.refresh_token;
    if (newTokens.expiry_date) updateData.expiry_date = newTokens.expiry_date;

    await supabase
      .from('google_tokens')
      .update(updateData)
      .eq('id', 1);
  });

  return oauth2Client;
}

export async function syncEvent(logId: string) {
  try {
    const oauth2Client = await getOAuthClient();
    if (!oauth2Client) return;

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 1. Buscar dados da aula e do aluno
    const { data: log } = await supabase
      .from('attendance_logs')
      .select('*, students(*)')
      .eq('id', logId)
      .single();

    if (!log) return;

    const student = log.students;
    const summary = `${log.status === 'present' ? '✅' : '❌'} Aula: ${student.name}`;
    const description = `Conteúdo: ${log.content || 'Não informado'}\nStatus: ${log.status}\nNotas: ${log.class_notes || ''}`;

    // Usar horário específico da aula ou cair para o padrão do aluno
    const classTime = log.lesson_time || student.schedule?.match(/(\d{2}:\d{2})/)?.[1] || '14:00';
    const startDateTime = `${log.lesson_date}T${classTime}:00`;
    
    // Calcular fim (50 min depois)
    const [hours, minutes] = classTime.split(':').map(Number);
    const endDate = new Date(`${log.lesson_date}T${classTime}:00`);
    endDate.setMinutes(endDate.getMinutes() + 50);
    const endDateTime = endDate.toISOString();

    const eventData: any = {
      summary,
      description,
      start: {
        dateTime: new Date(startDateTime).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: new Date(endDateTime).toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: student.email ? [{ email: student.email }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 60 },
        ],
      },
    };

    if (log.google_event_id) {
      // Atualizar existente
      await calendar.events.update({
        calendarId: 'primary',
        eventId: log.google_event_id,
        requestBody: eventData,
      });
    } else {
      // Criar novo
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      if (res.data.id) {
        await supabase
          .from('attendance_logs')
          .update({ google_event_id: res.data.id })
          .eq('id', logId);
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar com Google Calendar:', error);
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const oauth2Client = await getOAuthClient();
    if (!oauth2Client) return;

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  } catch (error) {
    console.error('Erro ao deletar evento do Google Calendar:', error);
  }
}
