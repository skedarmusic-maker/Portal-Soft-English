import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Salvar os tokens no Supabase. Como é um sistema de professora única,
    // usaremos uma tabela 'google_tokens' com ID fixo ou apenas insert/update
    
    const { error } = await supabase
      .from('google_tokens')
      .upsert({ 
        id: 1, // ID fixo para a professora admin
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null, // O refresh_token só vem na primeira vez ou se forçar prompt=consent
        expiry_date: tokens.expiry_date
      });

    if (error) {
      console.error('Erro ao salvar tokens:', error);
      return NextResponse.json({ error: 'Erro ao salvar no banco' }, { status: 500 });
    }

    // Redireciona de volta para a tela de configurações ou dashboard
    return NextResponse.redirect(new URL('/calendar', request.url));
  } catch (error) {
    console.error('Erro ao trocar código por tokens:', error);
    return NextResponse.json({ error: 'Autenticação falhou' }, { status: 500 });
  }
}
