// src/app/api/protected/route.ts

import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = req.headers.get("Authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return NextResponse.json({ user: decodedToken });
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
 