import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { spawn } from "child_process";
import fs from "fs/promises";

function runRScript(scriptPath: string, jornada: string): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve) => {
    const r = spawn("Rscript", [scriptPath, jornada]);
    let stderr = "";
    r.stderr.on("data", (data) => { stderr += data.toString(); });
    r.on("close", (code) => resolve({ code: code ?? 1, stderr }));
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { jornada } = await req.json();

  if (!jornada) {
    return NextResponse.json({ error: "Parámetro 'jornada' requerido" }, { status: 400 });
  }

  const scriptPath = path.join(process.cwd(), "r-scripts", "obtenerDatos.r");
  const outputPath = path.join(process.cwd(), "r-scripts", `jornada_${jornada}_stats.csv`);

  const { code, stderr } = await runRScript(scriptPath, jornada);

  if (code !== 0) {
    console.error("Error al ejecutar script R:", stderr);
    return NextResponse.json({ error: "Error en script R", stderr }, { status: 500 });
  }

  try {
    const csvContent = await fs.readFile(outputPath, "utf-8");
    const rows = csvContent
      .split("\n")
      .map((line) => line.split(","))
      .filter((r) => r.length > 1);
    return NextResponse.json({ ok: true, datos: rows });
  } catch {
    return NextResponse.json({ error: "No se pudo leer el CSV generado" }, { status: 500 });
  }
}
