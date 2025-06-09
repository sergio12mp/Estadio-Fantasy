// src/lib/data.ts

import { ReactNode } from "react"; // Necesario para ReactNode en CartaJugadorEnPlantilla (aunque no se usa en esta versión, puede que lo necesites para otros componentes)

// Define los tipos de posición de la base de datos (DB)
// ¡Añadimos 'WB' aquí!
export type PosicionDB = 'GK' | 'CB' | 'RB' | 'LB' | 'DM' | 'CM' | 'LM' | 'RM' | 'AM' | 'LW' | 'RW' | 'FW' | 'ST' | 'WB';

// Define los tipos de posición que usas en el frontend (más genéricas)
export type PosicionFrontend = "POR" | "DEF" | "MED" | "DEL";

// --- Mapeo de posiciones de DB a Frontend (¡ÚNICO PUNTO DE VERDAD!) ---
// ¡Añadimos el mapeo para 'WB' aquí!
export const POSICIONES_MAPEO: { [key in PosicionDB]: PosicionFrontend } = {
  'GK': "POR",
  'CB': "DEF",
  'RB': "DEF",
  'LB': "DEF",
  'DM': "MED",
  'CM': "MED",
  'LM': "MED",
  'RM': "MED",
  'AM': "MED",
  'LW': "DEL",
  'RW': "DEL",
  'FW': "DEL",
  'ST': "DEL",
  'WB': "DEF", // Mapeamos Wing Back a Defensa
};

// Función para obtener la posición de frontend desde la DB de forma segura
// Ahora maneja múltiples posiciones separadas por comas
export function getPosicionFrontend(posicionDBString: string): PosicionFrontend {
    // Dividir la cadena por comas y limpiar espacios para obtener posiciones individuales
    const posicionesIndividuales = posicionDBString.split(',').map(pos => pos.trim() as PosicionDB);

    for (const singlePos of posicionesIndividuales) {
        // Asegurarse de que la posición individual sea un tipo válido de PosicionDB
        if (singlePos in POSICIONES_MAPEO) {
            return POSICIONES_MAPEO[singlePos];
        }
    }

    // Si ninguna de las posiciones individuales es válida o mapeable, lanzar un error
    // Este error solo debería ocurrir si hay un valor en DB que no está en PosicionDB o POSICIONES_MAPEO
    throw new Error(`Posición de BBDD desconocida o no mapeada: ${posicionDBString}. Ninguna posición válida encontrada en la cadena.`);
}

// Interfaz para la información básica de un Jugador (sin relación con CartaJugador)
export interface Jugador {
    idJugador: number;
    Nombre: string;
    Edad: string; // O number, si en DB es INT
    Pais: string;
    Posicion: PosicionDB; // Posición detallada de la DB (considerando que puede ser una de las singulares)
    Precio: number;
    idEquipo: number;
    Puntos: number; // Asegúrate de que este campo exista en tu tabla Jugador si lo usas
}

export interface Equipo {
    idEquipo: number;
    Nombre: string;
}

export interface Manager {
    idManager: number;
    nombre: string;
    email: string;
    idGoogle: string;
    oro: number;
    balones: number;
}

// Interfaz para la carta de jugador que posee un Manager (devuelta por /api/cartas-manager)
export interface CartaJugadorManager {
    idCartaJugador: number;
    Rareza: string; // Puede ser "Común", "Raro", "Épico", "Legendario"
    Jugador_idJugadorDB: number; // ID del jugador base
    NombreJugador: string;
    PosicionJugadorDB: string; // <--- CAMBIO AQUÍ: Ahora puede ser un string con múltiples posiciones.
                               // La función getPosicionFrontend se encargará de esto.
    Edad: string;
    Pais: string;
    Precio: number; // Precio de la carta
    Puntos: number; // Puntos del jugador (generalmente de la tabla Jugador)
    NombreEquipo: string;
}

// Interfaz para la carta de objeto que posee un Manager (devuelta por /api/cartas-manager/objetos)
export interface CartaObjetoManager {
    idCartaObjeto: number;
    Rareza: string; // "Común", "Raro", "Épico", "Legendario"
    Objeto_idObjetoDB: number; // El ID del objeto base de la tabla 'Objetos'
    NombreObjeto: string;
    DescripcionObjeto: string;
    PrecioObjeto: number;
    // Otros campos que puedan venir de la tabla 'Objetos', por ejemplo, 'Tipo', 'Efecto'
    TipoObjeto?: string;
    EfectoObjeto?: string;
}

// Interfaz para un objeto que ha sido equipado a un jugador
export interface ObjetoEquipado {
    idCartaObjeto: number; // El ID de la carta de objeto específica equipada
    Nombre: string; // Nombre del objeto
    Rareza: string; // Rareza del objeto
    Tipo?: string; // Tipo del objeto (ej. "Ataque", "Defensa", "Habilidad")
    Efecto?: string; // Descripción del efecto del objeto
    // Puedes añadir más propiedades relevantes del objeto aquí si las necesitas en el frontend
}

// El tipo que el componente PlayerCard y la plantilla realmente van a usar.
// Es una combinación de CartaJugadorManager y las propiedades específicas de la plantilla.
export interface CartaJugadorEnPlantilla {
    idCartaJugador: number;
    idJugador: number; // `Jugador_idJugadorDB` de CartaJugadorManager
    Nombre: string; // `NombreJugador`
    Edad: string;
    Pais: string;
    Posicion: string; // <--- CAMBIO AQUÍ: Ahora puede ser un string con múltiples posiciones.
    PosicionFrontend: PosicionFrontend; // La posición genérica mapeada para la UI (derivada de Posicion)
    Precio: number;
    Puntos: number;
    Rareza: "Común" | "Raro" | "Épico" | "Legendario"; // Rareza de la carta de jugador
    NombreEquipo: string;
    objetosEquipados: ObjetoEquipado[]; // ¡Array de objetos equipados en este jugador!
    maxObjetosSlots: number; // Slots disponibles para objetos según la rareza de este jugador
    posicionEnPlantilla: number; // El índice del slot en la plantilla (0-10), crucial para el Map
}

// Función para determinar el número de slots de objeto según la rareza del jugador
export function obtenerSlotsObjetoPorRareza(rareza: CartaJugadorEnPlantilla['Rareza']): number {
    switch (rareza) {
        case "Común": return 0;
        case "Raro": return 1;
        case "Épico": return 2;
        case "Legendario": return 3;
        default: return 0; // Por defecto o para rareza no reconocida
    }
}

// Función para obtener el manager por su idGoogle (ejemplo, si lo tienes en tu sistema de auth)
// Si tu autenticación es diferente, puedes eliminar o adaptar esto.
export async function getManagerByIdGoogle(idGoogle: string) {
    const res = await fetch(`/api/manager?idGoogle=${idGoogle}`);
    if (!res.ok) throw new Error("No se pudo obtener el manager");
    const data = await res.json();
    if (!data.manager) {
        throw new Error("Manager no encontrado");
    }
    return data; // { found: true, manager }
}

// Función de ejemplo para actualizar manager (si la tienes)
export async function updateManager(id: number, data: any) {
    const res = await fetch(`/api/manager/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("No se pudo actualizar el manager");
    return res.json();
}

// Obtener la economía del manager (oro y balones)
export async function getManagerEconomy(id: number) {
    const res = await fetch(`/api/manager/economia/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener la economía del manager");
    return res.json();
}

// Actualizar la economía del manager (oro y balones)
export async function updateManagerEconomy(id: number, oro: number, balones: number) {
    const res = await fetch(`/api/manager/economia/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oro, balones }),
    });
    if (!res.ok) throw new Error("No se pudo actualizar la economía del manager");
    return res.json();
}