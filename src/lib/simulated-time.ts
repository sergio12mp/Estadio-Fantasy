import { db } from "@/lib/mysql";

export async function getSimulatedDate(): Promise<Date> {
  const [rows]: [any[]] = await db.query(
    "SELECT valor FROM Config WHERE clave = 'fecha_actual_simulada'"
  );
  const row = rows[0];

  if (row?.valor) {
    return new Date(row.valor);
  }

  // fallback: devuelve la hora actual real si no hay simulada
  return new Date();
}
