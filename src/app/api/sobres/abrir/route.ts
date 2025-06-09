import { NextRequest, NextResponse } from 'next/server';
import { abrirSobre, getProbabilidades, PACK_COSTS, PackType } from '@/lib/packs';

// Almacén simple en memoria para el pitty de cada manager
const pittyMap = new Map<number, number>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get('managerId');
  const pitty = managerId ? pittyMap.get(Number(managerId)) ?? 0 : 0;
  const probabilidades = getProbabilidades(pitty);
  return NextResponse.json({ pitty, probabilidades, costos: PACK_COSTS });
}

export async function POST(req: NextRequest) {
  try {
    const { managerId, tipo } = await req.json();
    if (!managerId || !tipo) {
      return NextResponse.json(
        { error: 'managerId y tipo son requeridos' },
        { status: 400 }
      );
    }

    const pittyActual = pittyMap.get(managerId) ?? 0;
    const resultado = abrirSobre(tipo as PackType, pittyActual);
    pittyMap.set(managerId, resultado.nuevaPitty);
    return NextResponse.json({
      ...resultado,
      costo: PACK_COSTS[tipo as PackType],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al abrir el sobre', details: error.message },
      { status: 500 }
    );
  }
}
