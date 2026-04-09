// GET  /api/admin/posiciones  — lista todos los jugadores con su posición y override
// PATCH /api/admin/posiciones  — guarda/borra el override de un jugador
import { db } from '@/lib/mysql';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get('nombre') ?? '';
    const equipo = searchParams.get('equipo') ?? '';
    const posicion = searchParams.get('posicion') ?? '';   // POR|DEF|MED|DEL|'' para todos
    const soloOverrides = searchParams.get('soloOverrides') === '1';

    try {
        let query = `
            SELECT j.idJugador, j.Nombre, j.Posicion, e.Nombre AS NombreEquipo,
                   po.posicionFrontend AS override
            FROM Jugador j
            JOIN Equipo e ON j.idEquipo = e.idEquipo
            LEFT JOIN PosicionOverride po ON po.idJugador = j.idJugador
            WHERE 1=1
        `;
        const params: any[] = [];

        if (nombre) {
            query += ' AND j.Nombre LIKE ?';
            params.push(`%${nombre}%`);
        }
        if (equipo) {
            query += ' AND e.Nombre LIKE ?';
            params.push(`%${equipo}%`);
        }
        if (soloOverrides) {
            query += ' AND po.posicionFrontend IS NOT NULL';
        }

        query += ' ORDER BY e.Nombre ASC, j.Nombre ASC';

        const [rows]: any = await db.query(query, params);
        const jugadores = Array.isArray(rows[0]) ? rows[0] : rows;

        // Filtro de posición calculada (no está en DB, se calcula en frontend)
        // pero si viene el filtro lo aplicamos sobre el override o la posición mapeada
        const MAPEO: Record<string, string> = {
            GK: 'POR', CB: 'DEF', RB: 'DEF', LB: 'DEF', WB: 'DEF',
            DM: 'MED', CM: 'MED', LM: 'MED', RM: 'MED', AM: 'MED',
            LW: 'DEL', RW: 'DEL', FW: 'DEL', ST: 'DEL',
        };

        const resultado = jugadores.map((j: any) => {
            const primera = (j.Posicion ?? '').split(',')[0].trim();
            const mapeada = MAPEO[primera] ?? 'DEL';
            return { ...j, posicionMapeada: mapeada };
        });

        const filtrada = posicion
            ? resultado.filter((j: any) => (j.override ?? j.posicionMapeada) === posicion)
            : resultado;

        return NextResponse.json({ jugadores: filtrada });
    } catch (err: any) {
        console.error('GET /api/admin/posiciones error:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { idJugador, posicionFrontend } = await req.json();

        if (!idJugador) {
            return NextResponse.json({ error: 'idJugador requerido' }, { status: 400 });
        }

        if (!posicionFrontend) {
            // Eliminar override
            await db.query('DELETE FROM PosicionOverride WHERE idJugador = ?', [idJugador]);
            return NextResponse.json({ ok: true, accion: 'eliminado' });
        }

        const validas = ['POR', 'DEF', 'MED', 'DEL'];
        if (!validas.includes(posicionFrontend)) {
            return NextResponse.json({ error: 'posicionFrontend inválida' }, { status: 400 });
        }

        await db.query(
            `INSERT INTO PosicionOverride (idJugador, posicionFrontend)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE posicionFrontend = VALUES(posicionFrontend)`,
            [idJugador, posicionFrontend]
        );

        return NextResponse.json({ ok: true, accion: 'guardado' });
    } catch (err: any) {
        console.error('PATCH /api/admin/posiciones error:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
