// GET /api/admin/posiciones/export
// Devuelve un fichero .sql con los INSERT de todos los overrides actuales.
// Guarda este fichero y ejecútalo tras un reset de BD para restaurar los overrides.
import { queryRows } from '@/lib/db-utils';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const overrides = await queryRows(
            `SELECT po.idJugador, po.posicionFrontend, j.Nombre
             FROM PosicionOverride po
             JOIN Jugador j ON j.idJugador = po.idJugador
             ORDER BY po.idJugador ASC`
        );

        if (overrides.length === 0) {
            const sql = '-- Sin overrides de posición registrados.\n';
            return new Response(sql, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="posicion_overrides.sql"',
                },
            });
        }

        const lines = [
            '-- PosicionOverride export — Estadio Fantasy',
            `-- Generado: ${new Date().toISOString()}`,
            '-- Ejecutar DESPUÉS de recrear la BD para restaurar los overrides.',
            '',
            'USE mydb;',
            '',
        ];

        for (const row of overrides as any[]) {
            lines.push(
                `-- ${row.Nombre}`,
                `INSERT INTO PosicionOverride (idJugador, posicionFrontend) VALUES (${row.idJugador}, '${row.posicionFrontend}') ON DUPLICATE KEY UPDATE posicionFrontend = VALUES(posicionFrontend);`,
            );
        }
        lines.push('');

        const sql = lines.join('\n');

        return new Response(sql, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': 'attachment; filename="posicion_overrides.sql"',
            },
        });
    } catch (err: any) {
        console.error('GET /api/admin/posiciones/export error:', err);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
