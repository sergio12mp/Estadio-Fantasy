import { NextRequest, NextResponse } from 'next/server';
import { abrirSobre, getProbabilidades, PACK_COSTS, PackType } from '@/lib/packs';
import { currencyMap } from '../../currency/route';

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
    const { managerId, tipo, moneda } = await req.json();
    if (!managerId || !tipo || !moneda) {
      return NextResponse.json(
        { error: 'managerId, tipo y moneda son requeridos' },
        { status: 400 }
      );
    }

    const pittyActual = pittyMap.get(managerId) ?? 0;
    const resultado = await abrirSobre(tipo as PackType, pittyActual);
    pittyMap.set(managerId, resultado.nuevaPitty);

    const costos = PACK_COSTS[tipo as PackType];
    const entry = currencyMap.get(managerId) ?? { oro: 0, balones: 0 };
    if (
      (moneda === 'oro' && entry.oro < costos.oro) ||
      (moneda === 'balones' && entry.balones < costos.balones)
    ) {
      return NextResponse.json(
        { error: 'No hay fondos suficientes' },
        { status: 400 }
      );
    }

    if (moneda === 'oro') entry.oro -= costos.oro;
    else entry.balones -= costos.balones;
    currencyMap.set(managerId, entry);
    const nuevaEconomia = entry;

    return NextResponse.json({
      ...resultado,
      costo: costos,
      nuevaEconomia,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al abrir el sobre', details: error.message },
      { status: 500 }
    );
  }
}
