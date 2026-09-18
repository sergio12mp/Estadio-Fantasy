import { NextResponse } from 'next/server';
import { queryRows } from '@/lib/db-utils';
import { db } from '@/lib/mysql';
import { slugifyPlayerName } from '@/lib/player-image';

export async function POST() {
  try {
    const jugadores = await queryRows<{ idJugador: number; Nombre: string }>(
      'SELECT idJugador, Nombre FROM Jugador WHERE slug IS NULL OR slug = ""'
    );

    let actualizados = 0;
    for (const j of jugadores) {
      const slug = slugifyPlayerName(j.Nombre ?? '');
      if (!slug) continue;
      await db.query('UPDATE Jugador SET slug = ? WHERE idJugador = ?', [slug, j.idJugador]);
      actualizados++;
    }

    return NextResponse.json({ ok: true, actualizados });
  } catch (error: any) {
    console.error('Error generando slugs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
