// app/api/plantilla/route.ts
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import { mapearPosicion, cargarOverrides } from '@/lib/posicion';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const managerId = searchParams.get("managerId");
        const idJornada = searchParams.get("idJornada");

        if (!managerId || !idJornada) {
            return NextResponse.json({ error: "Faltan parámetros managerId o idJornada" }, { status: 400 });
        }

        const managerIdNum = parseInt(managerId as string);
        const idJornadaNum = parseInt(idJornada as string);

        if (isNaN(managerIdNum) || isNaN(idJornadaNum)) {
            return NextResponse.json({ error: "managerId o idJornada no son números válidos" }, { status: 400 });
        }

        // Primero, obtener la plantilla principal
        const [plantillaRows]: any = await db.query(
            `SELECT idPlantilla, Alineacion, Puntos, idJornada, idManager
             FROM Plantilla
             WHERE idManager = ? AND idJornada = ?`,
            [managerIdNum, idJornadaNum]
        );

        const plantilla = Array.isArray(plantillaRows[0]) ? plantillaRows[0][0] : plantillaRows[0];

        if (!plantilla) {
            return NextResponse.json({ error: "Plantilla no encontrada para la jornada y manager especificados." }, { status: 404 });
        }

        // Luego, obtener los jugadores y objetos asociados a esa plantilla,
        // incluyendo los puntos calculados de las estadísticas de esa jornada.
        const [jugadoresEnCampoRows]: any = await db.query(
            `SELECT
                pjo.idCartaJugador, pjo.posicionEnPlantilla,
                pjo.idCartaObjeto1, pjo.idCartaObjeto2, pjo.idCartaObjeto3,
                cj.Rareza AS RarezaCartaJugador,
                j.idJugador, j.Nombre AS NombreJugador, j.Posicion AS PosicionJugadorDB, j.Edad, j.Pais, j.Precio,
                e.Nombre AS NombreEquipo,
                co1.Rareza AS Rareza1, o1.idObjetos AS idO1, o1.Nombre AS NombreO1, o1.Descripcion AS DescO1, o1.ValorEfecto AS Valor1, o1.Efecto AS Efecto1, o1.Estadistica AS Stat1,
                co2.Rareza AS Rareza2, o2.idObjetos AS idO2, o2.Nombre AS NombreO2, o2.Descripcion AS DescO2, o2.ValorEfecto AS Valor2, o2.Efecto AS Efecto2, o2.Estadistica AS Stat2,
                co3.Rareza AS Rareza3, o3.idObjetos AS idO3, o3.Nombre AS NombreO3, o3.Descripcion AS DescO3, o3.ValorEfecto AS Valor3, o3.Efecto AS Efecto3, o3.Estadistica AS Stat3,
                es.Puntos AS PuntosJornada,
                es.Goles, es.Asistencias, es.TirosPenalti, es.TirosPenaltiIntentados,
                es.TarjetasAmarillas, es.TarjetasRojas, es.Disparos, es.DisparosPorteria,
                es.Toques, es.Entradas, es.Intercepciones, es.Bloqueos,
                es.PasesCompletados, es.PasesProgresivos, es.AccionesCreadasDeGol, es.AccionesCreadasDeTiro,
                es.Paradas, es.GolesEncajados, es.PenaltisParados
             FROM PlantillaJugadorObjeto pjo
             JOIN CartaJugador cj ON pjo.idCartaJugador = cj.idCartaJugador
             JOIN Jugador j ON cj.Jugador_idJugador = j.idJugador
             JOIN Equipo e ON j.idEquipo = e.idEquipo
             LEFT JOIN CartaObjeto co1 ON pjo.idCartaObjeto1 = co1.idCartaObjeto
             LEFT JOIN Objetos o1 ON co1.idObjetos = o1.idObjetos
             LEFT JOIN CartaObjeto co2 ON pjo.idCartaObjeto2 = co2.idCartaObjeto
             LEFT JOIN Objetos o2 ON co2.idObjetos = o2.idObjetos
             LEFT JOIN CartaObjeto co3 ON pjo.idCartaObjeto3 = co3.idCartaObjeto
             LEFT JOIN Objetos o3 ON co3.idObjetos = o3.idObjetos
             LEFT JOIN Estadisticas es ON es.idJugador = j.idJugador AND es.idJornada = ?
             WHERE pjo.idPlantilla = ?
             ORDER BY pjo.posicionEnPlantilla`,
            [idJornadaNum, plantilla.idPlantilla]
        );

        const jugadoresEnCampoData = Array.isArray(jugadoresEnCampoRows[0]) ? jugadoresEnCampoRows[0] : jugadoresEnCampoRows;

        function calcBonus(efecto: string | null, stat: string | null, valor: number | null, puntosBase: number, row: any): number {
            if (!efecto || !valor) return 0;
            if (efecto === 'multiplicador') return parseFloat((puntosBase * (valor - 1)).toFixed(2));
            if (efecto === 'suma' && stat) return parseFloat(((row[stat] ?? 0) * valor).toFixed(2));
            return 0;
        }

        // Cargar overrides de posición para todos los jugadores de la plantilla
        const idsJugadores = jugadoresEnCampoData.map((r: any) => r.idJugador as number);
        const overrides = await cargarOverrides(idsJugadores);

        const jugadoresEnCampoSparse: (any | null)[] = Array(11).fill(null);
        for (const row of jugadoresEnCampoData) {
            const pos: number = row.posicionEnPlantilla;
            if (pos < 0 || pos >= 11) continue;
            const puntosBase = row.PuntosJornada ?? 0;
            const objetos: any[] = [];
            let bonus = 0;
            for (const [idCol, rarezaCol, idOCol, nombreCol, descCol, valorCol, efectoCol, statCol] of [
                ['idCartaObjeto1', 'Rareza1', 'idO1', 'NombreO1', 'DescO1', 'Valor1', 'Efecto1', 'Stat1'],
                ['idCartaObjeto2', 'Rareza2', 'idO2', 'NombreO2', 'DescO2', 'Valor2', 'Efecto2', 'Stat2'],
                ['idCartaObjeto3', 'Rareza3', 'idO3', 'NombreO3', 'DescO3', 'Valor3', 'Efecto3', 'Stat3'],
            ]) {
                if (row[idCol]) {
                    bonus += calcBonus(row[efectoCol], row[statCol], row[valorCol], puntosBase, row);
                    objetos.push({
                        idCartaObjeto: row[idCol],
                        idObjetos: row[idOCol],
                        Nombre: row[nombreCol],
                        Rareza: row[rarezaCol],
                        Descripcion: row[descCol],
                        ValorEfecto: row[valorCol] ?? 1.0,
                        Efecto: row[efectoCol],
                    });
                }
            }
            jugadoresEnCampoSparse[pos] = {
                idJugador: row.idJugador,
                idCartaJugador: row.idCartaJugador,
                Nombre: row.NombreJugador,
                Edad: row.Edad,
                Pais: row.Pais,
                Posicion: row.PosicionJugadorDB,
                PosicionFrontend: overrides.get(row.idJugador) ?? mapearPosicion(row.PosicionJugadorDB),
                NombreEquipo: row.NombreEquipo,
                Rareza: row.RarezaCartaJugador,
                Precio: row.Precio,
                PuntosJornada: row.PuntosJornada ?? null,
                BonusObjeto: bonus,
                objetosEquipados: objetos,
                maxObjetosSlots: 0,
                posicionEnPlantilla: pos,
            };
        }

        return NextResponse.json({ plantilla, jugadoresEnCampo: jugadoresEnCampoSparse }, { status: 200 });

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR: Fallo al cargar plantilla:", error);
        if (error.code) console.error("SQL Error Code:", error.code);
        if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
        return NextResponse.json({ error: "Error interno del servidor al cargar plantilla." }, { status: 500 });
    }
}
// app/api/plantilla/route.ts (continúa del GET, añade este POST abajo)

// app/api/plantilla/route.ts (POST - PARTE MODIFICADA)

export async function POST(req: NextRequest) {
    try {
        const { managerId, idJornada, alineacionLabel, jugadoresParaGuardar } = await req.json();

        if (!managerId || !idJornada || !alineacionLabel || !Array.isArray(jugadoresParaGuardar)) {
            return NextResponse.json({ error: "Faltan datos requeridos para guardar la plantilla." }, { status: 400 });
        }

        const managerIdNum = parseInt(managerId as string);
        const idJornadaNum = parseInt(idJornada as string);

        if (isNaN(managerIdNum) || isNaN(idJornadaNum)) {
            return NextResponse.json({ error: "managerId o idJornada no son números válidos." }, { status: 400 });
        }

        let idPlantillaActual: number;

        // Paso 1: Verificar si ya existe una plantilla para esta jornada y manager
        // Usar transacciones para asegurar la atomicidad de la operación
        await db.query("START TRANSACTION"); // Iniciar transacción

        try {
            const [existingPlantillaResult]: any = await db.query(
                "SELECT idPlantilla FROM Plantilla WHERE idManager = ? AND idJornada = ?",
                [managerIdNum, idJornadaNum]
            );
            const existingPlantillaRows = Array.isArray(existingPlantillaResult[0]) ? existingPlantillaResult[0] : existingPlantillaResult;

            if (existingPlantillaRows.length > 0) {
                // Plantilla existente: Obtener su ID y limpiar entradas anteriores
                idPlantillaActual = existingPlantillaRows[0].idPlantilla;
                console.log(`INFO: Plantilla existente (${idPlantillaActual}) para Manager ${managerIdNum}, Jornada ${idJornadaNum}. Borrando entradas anteriores.`);
                await db.query("DELETE FROM PlantillaJugadorObjeto WHERE idPlantilla = ?", [idPlantillaActual]);
                // Opcional: Actualizar la alineación y puntos en la tabla Plantilla
                await db.query(
                    "UPDATE Plantilla SET Alineacion = ?, Puntos = ? WHERE idPlantilla = ?",
                    [alineacionLabel, 0, idPlantillaActual]
                );
            } else {
                // Nueva plantilla: Insertar en la tabla Plantilla
                console.log(`INFO: Creando nueva plantilla para Manager ${managerIdNum}, Jornada ${idJornadaNum}.`);
                const [insertPlantillaResult]: any = await db.query(
                    "INSERT INTO Plantilla (Alineacion, Puntos, idJornada, idManager) VALUES (?, ?, ?, ?)",
                    [alineacionLabel, 0, idJornadaNum, managerIdNum]
                );
                idPlantillaActual = insertPlantillaResult.insertId ?? insertPlantillaResult[0]?.insertId;

                if (!idPlantillaActual) {
                    throw new Error("No se pudo obtener el ID de la plantilla recién creada.");
                }
                console.log(`INFO: Nueva plantilla creada con ID: ${idPlantillaActual}`);
            }

            // Paso 2: Insertar los jugadores y sus objetos en PlantillaJugadorObjeto
            if (jugadoresParaGuardar.length > 0) {
                const valuesToInsert: (number | null)[][] = [];
                for (const jugador of jugadoresParaGuardar) {
                    const { idCartaJugador, posicionEnPlantilla } = jugador;
                    if (posicionEnPlantilla === undefined || posicionEnPlantilla === null || isNaN(posicionEnPlantilla)) {
                        throw new Error(`Posición inválida para el jugador ${idCartaJugador}.`);
                    }
                    const ids = (jugador.objetosEquipados ?? []).map((o: any) =>
                        typeof o === 'object' ? (o.idCartaObjeto ?? null) : (o ?? null)
                    );
                    const id1 = ids[0] ?? null;
                    const id2 = ids[1] ?? null;
                    const id3 = ids[2] ?? null;
                    valuesToInsert.push([idPlantillaActual, id1, id2, id3, idCartaJugador, posicionEnPlantilla]);
                }

                if (valuesToInsert.length > 0) {
                    // Consulta con múltiples VALUES
                    const insertQuery = `INSERT INTO PlantillaJugadorObjeto (idPlantilla, idCartaObjeto1, idCartaObjeto2, idCartaObjeto3, idCartaJugador, posicionEnPlantilla) VALUES ?`;
                    console.log(`DEBUG: Ejecutando inserción de ${valuesToInsert.length} filas en PlantillaJugadorObjeto.`);
                    await db.query(insertQuery, [valuesToInsert]); // Pasar un array de arrays
                    console.log(`INFO: ${valuesToInsert.length} entradas insertadas/actualizadas en PlantillaJugadorObjeto.`);
                }
            } else {
                console.log(`INFO: No hay jugadores para guardar en la plantilla para Manager ${managerIdNum}, Jornada ${idJornadaNum}.`);
            }

            await db.query("COMMIT"); // Confirmar transacción
            return NextResponse.json({ message: "Plantilla guardada exitosamente.", idPlantilla: idPlantillaActual }, { status: 200 });

        } catch (transactionError: any) {
            await db.query("ROLLBACK"); // Revertir transacción en caso de error
            throw transactionError; // Re-lanzar el error para que sea capturado por el catch externo
        }

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR: Fallo al guardar plantilla:", error);
        if (error.code) console.error("SQL Error Code:", error.code);
        if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
        return NextResponse.json({ error: "Error interno del servidor al guardar plantilla: " + error.message }, { status: 500 });
    }
}