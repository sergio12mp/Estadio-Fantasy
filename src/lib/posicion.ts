// src/lib/posicion.ts
// Helpers SERVER-SIDE para resolver la posición frontend de un jugador,
// consultando primero la tabla PosicionOverride antes de aplicar el mapeo automático.
import { queryRows } from '@/lib/db-utils';
import { POSICIONES_MAPEO, PosicionDB, PosicionFrontend } from '@/lib/data';

/**
 * Mapea un string de posición de FBref ("RW,CM") a PosicionFrontend
 * usando el primer token reconocido.
 */
export function mapearPosicion(posicionDBString: string): PosicionFrontend {
    const tokens = posicionDBString.split(',').map(p => p.trim() as PosicionDB);
    for (const t of tokens) {
        if (t in POSICIONES_MAPEO) return POSICIONES_MAPEO[t];
    }
    return 'DEL';
}

/**
 * Resuelve la posición frontend de UN jugador consultando PosicionOverride.
 * Si no hay override, usa el mapeo automático.
 */
export async function resolverPosicion(
    idJugador: number,
    posicionDB: string
): Promise<PosicionFrontend> {
    try {
        const rows = await queryRows<{ posicionFrontend: string }>(
            'SELECT posicionFrontend FROM PosicionOverride WHERE idJugador = ?',
            [idJugador]
        );
        if (rows.length > 0 && rows[0].posicionFrontend) {
            return rows[0].posicionFrontend as PosicionFrontend;
        }
    } catch {
        // Si falla la consulta, fallback al mapeo automático
    }
    return mapearPosicion(posicionDB);
}

/**
 * Resuelve los overrides de MUCHOS jugadores en una sola query.
 * Devuelve un Map<idJugador, PosicionFrontend> con los que tienen override.
 * Los que no aparecen en el map deben usar mapearPosicion().
 */
export async function cargarOverrides(
    idJugadores: number[]
): Promise<Map<number, PosicionFrontend>> {
    const result = new Map<number, PosicionFrontend>();
    if (idJugadores.length === 0) return result;

    try {
        const placeholders = idJugadores.map(() => '?').join(',');
        const rows = await queryRows<{ idJugador: number; posicionFrontend: string }>(
            `SELECT idJugador, posicionFrontend FROM PosicionOverride WHERE idJugador IN (${placeholders})`,
            idJugadores
        );
        for (const row of rows) {
            result.set(row.idJugador, row.posicionFrontend as PosicionFrontend);
        }
    } catch {
        // fallback: devolver map vacío, se usará mapeo automático
    }
    return result;
}
