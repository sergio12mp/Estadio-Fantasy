import {db} from "@/libs/mysql";


export interface Manager {
    idManager: number;
    Nombre: string;
    idGoogle: string;
    Email: string;
}


export async function GetManagerByEmail(email: string) {
  const [rows]: any = await db.query("SELECT * FROM mydb.Manager WHERE Email = ?", [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function CreateManager({ name, email, idGoogle }: { name: string; email: string; idGoogle: string }) {
  const result: any = await db.query(
    "INSERT INTO mydb.Manager (Nombre, Email, idGoogle) VALUES (?, ?, ?)",
    [name, email, idGoogle]
  );
  return { id: result.insertId };
}
