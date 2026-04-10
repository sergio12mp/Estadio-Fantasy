// src/lib/formations.ts
// Definición de las formaciones disponibles para el equipo.
// Extraído de mi-equipo/page.tsx para compartirlo en otros contextos (preview, validación, etc.).

import type { PosicionFrontend } from './data';

export interface Formacion {
  label: string;
  positions: { [key in PosicionFrontend]: number };
  order: PosicionFrontend[];
}

export const FORMACIONES: Formacion[] = [
  {
    label: '5-4-1',
    positions: { 'POR': 1, 'DEF': 5, 'MED': 4, 'DEL': 1 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '5-3-2',
    positions: { 'POR': 1, 'DEF': 5, 'MED': 3, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-5-1',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 5, 'DEL': 1 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-4-2',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 4, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-3-3',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 3, 'DEL': 3 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '3-5-2',
    positions: { 'POR': 1, 'DEF': 3, 'MED': 5, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '3-4-3',
    positions: { 'POR': 1, 'DEF': 3, 'MED': 4, 'DEL': 3 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
];
