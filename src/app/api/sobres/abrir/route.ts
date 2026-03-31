import { NextRequest, NextResponse } from 'next/server';
import { abrirSobre, getProbabilidades, PACK_COSTS, PackType } from '@/lib/packs';
import { db } from '@/lib/mysql';

async function getPity(managerId: number): Promise<number> {
  const [rows] = await db.query('SELECT pity FROM Manager WHERE idManager = ?', [managerId]);
  if (Array.isArray(rows) && rows.length > 0) return (rows as any[])[0].pity ?? 0;
  return 0;
}

async function getEconomia(managerId: number): Promise<{ oro: number; balones: number } | null> {
  const [rows] = await db.query('SELECT oro, balones FROM Manager WHERE idManager = ?', [managerId]);
  if (Array.isArray(rows) && rows.length > 0) {
    const { oro, balones } = (rows as any[])[0];
    return { oro, balones };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const managerId = searchParams.get('managerId');
  const pity = managerId ? await getPity(Number(managerId)) : 0;
  const probabilidades = getProbabilidades(pity);
  return NextResponse.json({ pity, probabilidades, costos: PACK_COSTS });
}

export async function POST(req: NextRequest) {
  try {
    const { managerId, tipo, moneda: monedaRaw } = await req.json();
    if (!managerId || !tipo || !monedaRaw) {
      return NextResponse.json({ error: 'managerId, tipo y moneda son requeridos' }, { status: 400 });
    }
    const moneda = (monedaRaw as string).toLowerCase() as 'oro' | 'balones';

    const economia = await getEconomia(Number(managerId));
    if (!economia) {
      return NextResponse.json({ error: 'El manager no tiene economía inicializada' }, { status: 400 });
    }

    const costos = PACK_COSTS[tipo as PackType];
    if (moneda === 'oro' && economia.oro < costos.oro) {
      return NextResponse.json({ error: 'No hay oro suficiente' }, { status: 400 });
    }
    if (moneda === 'balones' && economia.balones < costos.balones) {
      return NextResponse.json({ error: 'No hay balones suficientes' }, { status: 400 });
    }

    const pityActual = await getPity(Number(managerId));
    const resultado = await abrirSobre(tipo as PackType, pityActual);

    const nuevoOro = moneda === 'oro' ? economia.oro - costos.oro : economia.oro;
    const nuevosBalones = moneda === 'balones' ? economia.balones - costos.balones : economia.balones;

    // Guardar cartas en DB
    for (const carta of resultado.cartas) {
      if (carta.tipo === 'jugador') {
        await db.query(
          'INSERT INTO CartaJugador (Jugador_idJugador, Manager_idManager, Rareza) VALUES (?, ?, ?)',
          [carta.idDB, managerId, carta.rareza]
        );
      } else {
        // Usar la rareza fija del objeto en la tabla Objetos, no la aleatoria del sobre
        const [objRows]: any = await db.query(
          'SELECT Rareza FROM Objetos WHERE idObjetos = ?',
          [carta.idDB]
        );
        const rarezaObjeto = objRows?.[0]?.Rareza ?? carta.rareza;
        await db.query(
          'INSERT INTO CartaObjeto (idObjetos, idManager, Rareza) VALUES (?, ?, ?)',
          [carta.idDB, managerId, rarezaObjeto]
        );
      }
    }

    // Actualizar pity y economía
    await db.query(
      'UPDATE Manager SET pity = ?, oro = ?, balones = ? WHERE idManager = ?',
      [resultado.nuevaPitty, nuevoOro, nuevosBalones, managerId]
    );

    return NextResponse.json({
      ...resultado,
      costo: costos,
      nuevaEconomia: { oro: nuevoOro, balones: nuevosBalones },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al abrir el sobre', details: error.message },
      { status: 500 }
    );
  }
}
