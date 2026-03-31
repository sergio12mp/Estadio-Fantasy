import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

const PRECIOS_JUGADOR: Record<string, { balones: number; oro: number }> = {
  Comun:      { balones: 5_000,   oro: 1_000  },
  Rara:       { balones: 20_000,  oro: 4_000  },
  Epica:      { balones: 60_000,  oro: 12_000 },
  Legendaria: { balones: 150_000, oro: 30_000 },
};

const PRECIOS_OBJETO: Record<string, { balones: number; oro: number }> = {
  Comun:      { balones: 2_000,  oro: 400  },
  Rara:       { balones: 5_000,  oro: 1_000 },
  Epica:      { balones: 12_000, oro: 2_500 },
  Legendaria: { balones: 30_000, oro: 6_000 },
};

export async function GET() {
  try {
    const [jugadores]: any = await db.query(
      `SELECT j.idJugador, j.Nombre, j.Posicion, j.Edad, j.Pais, e.Nombre AS NombreEquipo
       FROM Jugador j
       JOIN Equipo e ON j.idEquipo = e.idEquipo
       ORDER BY e.Nombre, j.Nombre`
    );

    const [objetos]: any = await db.query(
      `SELECT idObjetos, Nombre, Rareza, Descripcion, Efecto, ValorEfecto, Estadistica
       FROM Objetos
       ORDER BY Rareza, Nombre`
    );

    return NextResponse.json({
      jugadores: jugadores ?? [],
      objetos: objetos ?? [],
      precios: { jugador: PRECIOS_JUGADOR, objeto: PRECIOS_OBJETO },
    });
  } catch (err) {
    console.error('Error al obtener catálogo de tienda:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { managerId, tipo, idItem, moneda, rareza } = await req.json();

    if (!managerId || !tipo || !idItem || !moneda) {
      return NextResponse.json(
        { error: 'managerId, tipo, idItem y moneda son requeridos' },
        { status: 400 }
      );
    }

    const [managerRows]: any = await db.query(
      'SELECT oro, balones FROM Manager WHERE idManager = ?',
      [managerId]
    );
    if (!managerRows?.length) {
      return NextResponse.json({ error: 'Manager no encontrado' }, { status: 404 });
    }
    const { oro, balones } = managerRows[0];

    let precio = 0;
    let rarezaCarta = 'Comun';

    if (tipo === 'jugador') {
      rarezaCarta = ['Comun', 'Rara', 'Epica', 'Legendaria'].includes(rareza) ? rareza : 'Comun';
      const precioJug = PRECIOS_JUGADOR[rarezaCarta] ?? PRECIOS_JUGADOR['Comun'];
      precio = moneda === 'oro' ? precioJug.oro : precioJug.balones;
    } else {
      const [objRows]: any = await db.query(
        'SELECT Rareza FROM Objetos WHERE idObjetos = ?',
        [idItem]
      );
      rarezaCarta = objRows?.[0]?.Rareza ?? 'Comun';
      const precioObj = PRECIOS_OBJETO[rarezaCarta] ?? PRECIOS_OBJETO['Comun'];
      precio = moneda === 'oro' ? precioObj.oro : precioObj.balones;
    }

    if (moneda === 'oro' && oro < precio) {
      return NextResponse.json({ error: 'No tienes suficiente oro' }, { status: 400 });
    }
    if (moneda === 'balones' && balones < precio) {
      return NextResponse.json({ error: 'No tienes suficientes balones' }, { status: 400 });
    }

    if (tipo === 'jugador') {
      await db.query(
        'INSERT INTO CartaJugador (Jugador_idJugador, Manager_idManager, Rareza) VALUES (?, ?, ?)',
        [idItem, managerId, rarezaCarta]
      );
    } else {
      await db.query(
        'INSERT INTO CartaObjeto (idObjetos, idManager, Rareza) VALUES (?, ?, ?)',
        [idItem, managerId, rarezaCarta]
      );
    }

    const newOro = moneda === 'oro' ? oro - precio : oro;
    const newBalones = moneda === 'balones' ? balones - precio : balones;
    await db.query(
      'UPDATE Manager SET oro = ?, balones = ? WHERE idManager = ?',
      [newOro, newBalones, managerId]
    );

    return NextResponse.json({ success: true, oro: newOro, balones: newBalones });
  } catch (err) {
    console.error('Error al comprar en tienda:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
