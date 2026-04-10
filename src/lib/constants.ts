// src/lib/constants.ts
// Constantes globales del juego. Centraliza números mágicos para que
// cambiar un parámetro de juego no requiera buscar en múltiples archivos.

/** Sistema de pity para apertura de sobres */
export const PITY_SYSTEM = {
  /** Número de sobres sin legendaria tras los cuales la probabilidad llega al 100% */
  MAX_PITY: 50,
};

/** Límites por defecto de equipo (los valores reales vienen de la tabla Config en DB) */
export const TEAM_LIMITS_DEFAULT = {
  /** Máximo de jugadores del mismo club en una plantilla */
  MAX_JUGADORES_POR_CLUB: 4,
  /** Límite de puntos de uso de plantilla */
  LIMITE_USO: 100,
};

/** Coste base de uso de un jugador/objeto por rareza */
export const COSTE_BASE_USO: Record<string, number> = {
  'Común':      1,
  'Comun':      1,
  'Raro':       2,
  'Rara':       2,
  'Épico':      3,
  'Epico':      3,
  'Épica':      3,
  'Epica':      3,
  'Legendario': 4,
  'Legendaria': 4,
};

/** Tramos de incremento por porcentaje de uso en jornada anterior */
export const USO_TRAMOS: Array<{ hasta: number; incremento: number }> = [
  { hasta: 20,  incremento: 0 },
  { hasta: 40,  incremento: 1 },
  { hasta: 60,  incremento: 2 },
  { hasta: 80,  incremento: 3 },
  { hasta: 100, incremento: 4 },
];

/** Probabilidades base de rareza al abrir un sobre */
export const BASE_PROBABILITIES = {
  Comun:      0.72,
  Rara:       0.20,
  Epica:      0.06,
  Legendaria: 0.02,
};
