// src/lib/db-utils.ts
// Utilidades para simplificar el manejo de resultados de queries MySQL2.
//
// El driver mysql2 devuelve resultados en dos formatos posibles:
//   - Pool connection: [rows, fields] donde rows es el array
//   - PoolCluster: [[rows, fields]] donde rows está en rows[0]
//
// queryRows() abstrae esto para que todos los routes puedan usar un patrón uniforme.

import { db } from './mysql';

/**
 * Ejecuta una query y devuelve el array de filas tipado.
 *
 * @example
 * const managers = await queryRows<{ idManager: number }>('SELECT idManager FROM Manager');
 */
export async function queryRows<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [result]: any = params
    ? await db.query(sql, params)
    : await db.query(sql);
  return (Array.isArray(result[0]) ? result[0] : result) as T[];
}

/**
 * Ejecuta una query que devuelve exactamente una fila (o null si no hay resultados).
 *
 * @example
 * const manager = await queryOne<{ idManager: number }>('SELECT idManager FROM Manager WHERE idManager = ?', [id]);
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await queryRows<T>(sql, params);
  return rows[0] ?? null;
}
