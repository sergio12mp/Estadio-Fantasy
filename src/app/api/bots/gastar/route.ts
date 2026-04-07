import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { abrirSobre } from "@/lib/packs";
import { PACK_COSTS } from "@/lib/packs-types";

const TIPO_SOBRE = "normal";
const COSTE_ORO = PACK_COSTS[TIPO_SOBRE].oro; // 10 oro por sobre normal

export async function POST() {
    try {
        const [bots]: any = await db.query(
            "SELECT idManager, oro, pity FROM Manager WHERE isBot = 1"
        );
        if (!bots?.length) {
            return NextResponse.json({ error: "No hay bots. Ejecuta primero /api/bots/seed" }, { status: 400 });
        }

        const resumen: Array<{ nombre: string; sobresAbiertos: number; oro: number }> = [];

        for (const bot of bots) {
            const { idManager } = bot;
            let oro: number = bot.oro;
            let pity: number = bot.pity;
            let sobresAbiertos = 0;

            // Abrir tantos sobres como permita el oro
            while (oro >= COSTE_ORO) {
                const resultado = await abrirSobre(TIPO_SOBRE, pity);

                // Guardar cartas resultantes
                for (const carta of resultado.cartas) {
                    if (carta.tipo === "jugador") {
                        await db.query(
                            "INSERT INTO CartaJugador (Jugador_idJugador, Manager_idManager, rareza) VALUES (?, ?, ?)",
                            [carta.idDB, idManager, carta.rareza]
                        );
                    } else {
                        const [objRows]: any = await db.query(
                            "SELECT Rareza FROM Objetos WHERE idObjetos = ?",
                            [carta.idDB]
                        );
                        const rarezaObjeto = objRows?.[0]?.Rareza ?? carta.rareza;
                        await db.query(
                            "INSERT INTO CartaObjeto (idObjetos, idManager, Rareza) VALUES (?, ?, ?)",
                            [carta.idDB, idManager, rarezaObjeto]
                        );
                    }
                }

                oro -= COSTE_ORO;
                pity = resultado.nuevaPitty;
                sobresAbiertos++;
            }

            // Actualizar oro y pity del bot
            await db.query(
                "UPDATE Manager SET oro = ?, pity = ? WHERE idManager = ?",
                [oro, pity, idManager]
            );

            // Obtener nombre para el resumen
            const [nombreRows]: any = await db.query(
                "SELECT Nombre FROM Manager WHERE idManager = ?",
                [idManager]
            );
            resumen.push({
                nombre: nombreRows?.[0]?.Nombre ?? `Bot #${idManager}`,
                sobresAbiertos,
                oro,
            });
        }

        return NextResponse.json({
            message: "Bots han gastado su oro en sobres normales",
            resumen,
        });
    } catch (error: any) {
        console.error("Error al gastar oro de bots:", error);
        return NextResponse.json({ error: "Error al gastar oro", detail: error.message }, { status: 500 });
    }
}
