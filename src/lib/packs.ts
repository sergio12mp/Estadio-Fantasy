export type Rarity = 'Comun' | 'Rara' | 'Epica' | 'Legendaria';
export type PackType = 'jugador' | 'objeto' | 'normal';

export interface PackCard {
  tipo: 'jugador' | 'objeto';
  rareza: Rarity;
}

export interface PackResult {
  cartas: PackCard[];
  nuevaPitty: number;
  probabilidades: Record<Rarity, number>;
}

const PITTY_MAX = 10;

const BASE_PROBABILITIES: Record<Rarity, number> = {
  Comun: 0.3,
  Rara: 0.4,
  Epica: 0.2,
  Legendaria: 0.1,
};

export const PACK_COSTS = {
  normal: { balones: 100, oro: 10 },
  jugador: { balones: 150, oro: 15 },
  objeto: { balones: 150, oro: 15 },
};

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

export function abrirSobre(
  tipo: PackType,
  pitty: number
): PackResult {
  const probabilidades = calcularProbabilidades(pitty);
  const cartas: PackCard[] = [];

  if (tipo === 'normal') {
    for (let i = 0; i < 3; i++) {
      cartas.push({ tipo: 'jugador', rareza: obtenerRareza(probabilidades) });
    }
    cartas.push({ tipo: 'objeto', rareza: obtenerRareza(probabilidades) });
    const aleatorio = Math.random() < 0.5 ? 'jugador' : 'objeto';
    cartas.push({ tipo: aleatorio, rareza: obtenerRareza(probabilidades) });
  } else {
    for (let i = 0; i < 5; i++) {
      cartas.push({ tipo, rareza: obtenerRareza(probabilidades) });
    }
  }

  const hayLegendaria = cartas.some((c) => c.rareza === 'Legendaria');
  const nuevaPitty = hayLegendaria ? 0 : Math.min(pitty + 1, PITTY_MAX);

  return { cartas, nuevaPitty, probabilidades };
}

export function getProbabilidades(pitty: number): Record<Rarity, number> {
  return calcularProbabilidades(pitty);
}
