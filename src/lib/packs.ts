import { db } from './mysql';
import {
  PACK_COSTS,
  PackCard,
  PackResult,
  PackType,
  Rarity,
} from './packs-types';

const PITTY_MAX = 10;

const BASE_PROBABILITIES: Record<Rarity, number> = {
  Comun: 0.3,
  Rara: 0.4,
  Epica: 0.2,
  Legendaria: 0.1,
};

let playerNamesCache: Promise<string[]> | null = null;
let objectNamesCache: Promise<string[]> | null = null;

async function getPlayerNames(): Promise<string[]> {
  if (!playerNamesCache) {
    playerNamesCache = db
      .query('SELECT Nombre FROM Jugador')
      .then(([rows]: any) => rows.map((r: any) => r.Nombre));
  }
  return playerNamesCache;
}

async function getObjectNames(): Promise<string[]> {
  if (!objectNamesCache) {
    objectNamesCache = db
      .query('SELECT Nombre FROM Objetos')
      .then(([rows]: any) => rows.map((r: any) => r.Nombre));
  }
  return objectNamesCache;
}

function nombreAleatorio(lista: string[]): string {
  const idx = Math.floor(Math.random() * lista.length);
  return lista[idx];
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
  let acumulado = prob.Legendaria;
  if (r < acumulado) return 'Legendaria';
  acumulado += prob.Epica;
  if (r < acumulado) return 'Epica';
  acumulado += prob.Rara;
  if (r < acumulado) return 'Rara';
  return 'Comun';
}

export async function abrirSobre(
  tipo: PackType,
  pitty: number
): Promise<PackResult> {
  const probabilidades = calcularProbabilidades(pitty);
  const playerNames = await getPlayerNames();
  const objectNames = await getObjectNames();
  const cartas: PackCard[] = [];

  if (tipo === 'normal') {
    for (let i = 0; i < 3; i++) {
      cartas.push({
        tipo: 'jugador',
        nombre: nombreAleatorio(playerNames),
        rareza: obtenerRareza(probabilidades),
      });
    }
    cartas.push({
      tipo: 'objeto',
      nombre: nombreAleatorio(objectNames),
      rareza: obtenerRareza(probabilidades),
    });
    const aleatorio = Math.random() < 0.5 ? 'jugador' : 'objeto';
    cartas.push({
      tipo: aleatorio,
      nombre:
        aleatorio === 'jugador'
          ? nombreAleatorio(playerNames)
          : nombreAleatorio(objectNames),
      rareza: obtenerRareza(probabilidades),
    });
  } else {
    for (let i = 0; i < 5; i++) {
      cartas.push({
        tipo,
        nombre:
          tipo === 'jugador'
            ? nombreAleatorio(playerNames)
            : nombreAleatorio(objectNames),
        rareza: obtenerRareza(probabilidades),
      });
    }
  }

  const hayLegendaria = cartas.some((c) => c.rareza === 'Legendaria');
  const nuevaPitty = hayLegendaria ? 0 : Math.min(pitty + 1, PITTY_MAX);

  return { cartas, nuevaPitty, probabilidades };
}

export function getProbabilidades(pitty: number): Record<Rarity, number> {
  return calcularProbabilidades(pitty);
}

export { PACK_COSTS } from './packs-types';export type { PackCard, PackResult, PackType, Rarity } from './packs-types';

