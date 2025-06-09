// src/database/manager.ts
import { db } from "@/lib/mysql";
import { QueryResult } from "mysql2";

// Buscar manager por email
export async function GetManagerByEmail(email: string) {
  const [rows]: [any[], any] = await db.query("SELECT * FROM Manager WHERE email = ?", [email]);
  return (rows as any[])[0] || null;
}

// Crear nuevo manager
export async function CreateManager({
  name,
  email,
  idGoogle,
}: {
  name: string;
  email: string;
  idGoogle: string;
}) {
  const [result] = await db.query(
    "INSERT INTO Manager (name, email, idGoogle, oro, balones) VALUES (?, ?, ?, 0, 0)",
    [name, email, idGoogle]
  ) as [QueryResult, any];

  return { id: (result as any).insertId };
}

// Obtener la economía de un manager por su id
export async function GetManagerEconomy(idManager: number) {
  const [rows]: [any[], any] = await db.query(
    "SELECT oro, balones FROM Manager WHERE idManager = ?",
    [idManager]
  );
  return (rows as any[])[0] || null;
}

// Actualizar la economía de un manager
export async function UpdateManagerEconomy(
  idManager: number,
  oro: number,
  balones: number
) {
  const [result] = await db.query(
    "UPDATE Manager SET oro = ?, balones = ? WHERE idManager = ?",
    [oro, balones, idManager]
  ) as [QueryResult, any];
  return { affectedRows: (result as any).affectedRows };
}
