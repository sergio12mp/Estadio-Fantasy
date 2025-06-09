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
    "INSERT INTO Manager (name, email, idGoogle) VALUES (?, ?, ?)",
    [name, email, idGoogle]
  ) as [QueryResult, any];

  return { id: (result as any).insertId };
}
