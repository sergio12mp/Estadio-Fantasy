export type Rarity = 'Comun' | 'Rara' | 'Epica' | 'Legendaria';
export type PackType = 'jugador' | 'objeto' | 'normal';

export interface PackCard {
  tipo: 'jugador' | 'objeto';
  nombre: string;
  rareza: Rarity;
}

export interface PackResult {
  cartas: PackCard[];
  nuevaPitty: number;
  probabilidades: Record<Rarity, number>;
}

export const PACK_COSTS = {
  normal: { balones: 100, oro: 10 },
  jugador: { balones: 150, oro: 15 },
  objeto: { balones: 150, oro: 15 },
};
