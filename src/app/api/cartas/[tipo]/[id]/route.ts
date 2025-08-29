import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { revalidatePath } from 'next/cache';

function reward(rareza: string): number {
  switch (rareza) {
    case 'Comun':
    case 'Común':
      return 5;
    case 'Raro':
    case 'Rara':
      return 10;
    case 'Epico':
    case 'Épico':
    case 'Epica':
      return 15;
    case 'Legendario':
    case 'Legendaria':
      return 20;
    default:
      return 0;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { tipo: string; id: string } }) {
  try {
    const managerId = Number(new URL(req.url).searchParams.get('managerId'));
    const id = Number(params.id);
    if (!managerId || !id) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    if (params.tipo === 'jugador') {
      const [rows]: any = await db.query(
        'SELECT rareza FROM CartaJugador WHERE idCartaJugador = ? AND Manager_idManager = ?',
        [id, managerId]
      );
      revalidatePath('/album');//Refrescar cache del álbum
      const r = Array.isArray(rows) ? rows[0] : rows;
      if (!r) return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });
      const rareza = r.rareza ?? r.Rareza;
      if (rareza === 'Comun' || rareza === 'Común') {
        return NextResponse.json({ error: 'No se pueden eliminar cartas comunes de jugador' }, { status: 400 });
      }
      await db.query('DELETE FROM CartaJugador WHERE idCartaJugador = ? AND Manager_idManager = ?', [id, managerId]);
      revalidatePath('/album');//Refrescar cache del álbum
      return NextResponse.json({ balonesGanados: reward(rareza) });
    } else if (params.tipo === 'objeto') {
      const [rows]: any = await db.query(
        'SELECT rareza FROM CartaObjeto WHERE idCartaObjeto = ? AND idManager = ?',
        [id, managerId]
      );
      const r = Array.isArray(rows) ? rows[0] : rows;
      if (!r) return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 });
      const rareza = r.rareza ?? r.Rareza;
      await db.query('DELETE FROM CartaObjeto WHERE idCartaObjeto = ? AND idManager = ?', [id, managerId]);
      return NextResponse.json({ balonesGanados: reward(rareza) });
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar la carta' }, { status: 500 });
  }
}
