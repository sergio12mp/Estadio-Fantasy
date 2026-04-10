import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { queryOne } from '@/lib/db-utils';
import { revalidatePath } from 'next/cache';
import { rewardJugador, rewardObjeto } from '@/lib/rewards';

export async function DELETE(req: NextRequest, { params }: { params: { tipo: string; id: string } }) {
  try {
    const managerId = Number(new URL(req.url).searchParams.get('managerId'));
    const id = Number(params.id);
    if (!managerId || !id) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    if (params.tipo === 'jugador') {
      revalidatePath('/album');
      const carta = await queryOne<{ rareza: string }>(
        'SELECT rareza FROM CartaJugador WHERE idCartaJugador = ? AND Manager_idManager = ?',
        [id, managerId]
      );
      if (!carta) return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });
      const rareza = carta.rareza;
      if (rareza === 'Comun' || rareza === 'Común') {
        return NextResponse.json({ error: 'No se pueden eliminar cartas comunes de jugador' }, { status: 400 });
      }
      await db.query('DELETE FROM CartaJugador WHERE idCartaJugador = ? AND Manager_idManager = ?', [id, managerId]);
      const balGanados = rewardJugador(rareza);
      await db.query('UPDATE Manager SET balones = balones + ? WHERE idManager = ?', [balGanados, managerId]);
      revalidatePath('/album');
      return NextResponse.json({ balonesGanados: balGanados });

    } else if (params.tipo === 'objeto') {
      const carta = await queryOne<{ rareza: string }>(
        'SELECT rareza FROM CartaObjeto WHERE idCartaObjeto = ? AND idManager = ?',
        [id, managerId]
      );
      if (!carta) return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });
      const rareza = carta.rareza;
      await db.query('DELETE FROM CartaObjeto WHERE idCartaObjeto = ? AND idManager = ?', [id, managerId]);
      const balGanados = rewardObjeto(rareza);
      await db.query('UPDATE Manager SET balones = balones + ? WHERE idManager = ?', [balGanados, managerId]);
      return NextResponse.json({ balonesGanados: balGanados });

    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar la carta' }, { status: 500 });
  }
}
