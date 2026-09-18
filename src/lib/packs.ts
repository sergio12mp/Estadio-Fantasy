import { db } from './mysql';
import {
  PACK_COSTS,
  PackCard,
  PackResult,
  PackType,
  Rarity,
} from './packs-types';

const PITTY_MAX = 50;

const BASE_PROBABILITIES: Record<Rarity, number> = {
  Comun: 0.72,
  Rara: 0.20,
  Epica: 0.06,
  Legendaria: 0.02,
};

type DBRow = { id: number; nombre: string; slug?: string | null; equipo?: string; posicion?: string };

let playerCachePromise: Promise<DBRow[]> | null = null;
let objectCachePromise: Promise<DBRow[]> | null = null;

async function getPlayers(): Promise<DBRow[]> {
  if (!playerCachePromise) {
    // INNER JOIN con MIN(idJugador) por nombre: un único row por jugador físico,
    // siempre el mismo idJugador canónico → imagen Cloudinary estable aunque el
    // jugador tenga filas en varios clubes.
    playerCachePromise = db
      .query(`SELECT J.idJugador AS id, J.Nombre AS nombre, J.slug AS slug,
                     J.Posicion AS posicion, E.Nombre AS equipo
              FROM Jugador J
              JOIN Equipo E ON J.idEquipo = E.idEquipo
              INNER JOIN (
                SELECT Nombre, MIN(idJugador) AS canonicalId
                FROM Jugador GROUP BY Nombre
              ) AS dedup ON J.idJugador = dedup.canonicalId`)
      .then(([rows]: any) => rows as DBRow[]);
  }
  return playerCachePromise;
}

async function getObjects(): Promise<DBRow[]> {
  if (!objectCachePromise) {
    objectCachePromise = db
      .query('SELECT idObjetos AS id, Nombre AS nombre FROM Objetos')
      .then(([rows]: any) => rows as DBRow[]);
  }
  return objectCachePromise;
}

function aleatorio<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

function calcularProbabilidades(pitty: number): Record<Rarity, number> {
  const baseLegendaria = BASE_PROBABILITIES.Legendaria;
  const nuevaLegendaria =
    baseLegendaria + (pitty / PITTY_MAX) * (1 - baseLegendaria);
  const factor = (1 - nuevaLegendaria) / (1 - baseLegendaria);
  return {
    Legendaria: nuevaLegendaria,
    Epica: BASE_PROBABILITIES.Epica * factor,
    Rara: BASE_PROBABILITIES.Rara * factor,
    Comun: BASE_PROBABILITIES.Comun * factor,
  };
}

function obtenerRareza(prob: Record<Rarity, number>): Rarity {
  const r = Math.random();
  let acc = prob.Legendaria;
  if (r < acc) return 'Legendaria';
  acc += prob.Epica;
  if (r < acc) return 'Epica';
  acc += prob.Rara;
  if (r < acc) return 'Rara';
  return 'Comun';
}

function makeCard(tipo: 'jugador' | 'objeto', row: DBRow, prob: Record<Rarity, number>): PackCard {
  return {
    tipo,
    nombre: row.nombre,
    idDB: row.id,
    rareza: obtenerRareza(prob),
    ...(row.slug ? { slug: row.slug } : {}),
    ...(row.equipo ? { equipo: row.equipo } : {}),
    ...(row.posicion ? { posicion: row.posicion } : {}),
  };
}

export async function abrirSobre(tipo: PackType, pitty: number): Promise<PackResult> {
  const probabilidades = calcularProbabilidades(pitty);
  const players = await getPlayers();
  const objects = await getObjects();
  const cartas: PackCard[] = [];

  if (players.length === 0 && (tipo === 'jugador' || tipo === 'normal')) {
    throw new Error('No hay jugadores en la base de datos. Importa datos primero.');
  }
  if (objects.length === 0 && (tipo === 'objeto' || tipo === 'normal')) {
    throw new Error('No hay objetos en la base de datos.');
  }

  if (tipo === 'normal') {
    for (let i = 0; i < 3; i++) {
      cartas.push(makeCard('jugador', aleatorio(players), probabilidades));
    }
    cartas.push(makeCard('objeto', aleatorio(objects), probabilidades));
    const esJugador = Math.random() < 0.5;
    cartas.push(
      esJugador
        ? makeCard('jugador', aleatorio(players), probabilidades)
        : makeCard('objeto', aleatorio(objects), probabilidades)
    );
  } else if (tipo === 'jugador') {
    for (let i = 0; i < 5; i++) {
      cartas.push(makeCard('jugador', aleatorio(players), probabilidades));
    }
  } else {
    for (let i = 0; i < 5; i++) {
      cartas.push(makeCard('objeto', aleatorio(objects), probabilidades));
    }
  }

  const hayLegendaria = cartas.some((c) => c.rareza === 'Legendaria');
  const nuevaPitty = hayLegendaria ? 0 : Math.min(pitty + 1, PITTY_MAX);

  return { cartas, nuevaPitty, probabilidades };
}

export function getProbabilidades(pitty: number): Record<Rarity, number> {
  return calcularProbabilidades(pitty);
}

export { PACK_COSTS } from './packs-types';
export type { PackCard, PackResult, PackType, Rarity } from './packs-types';
