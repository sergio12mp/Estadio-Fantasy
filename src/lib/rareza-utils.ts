// src/lib/rareza-utils.ts
// Utilidades de normalización de rareza compartidas en todo el proyecto.

import type { Rareza } from './rareza-config';

const RAREZA_MAP: Record<string, Rareza> = {
  'comun':      'Común',
  'común':      'Común',
  'raro':       'Raro',
  'rara':       'Raro',
  'epico':      'Épico',
  'epica':      'Épico',
  'épico':      'Épico',
  'épica':      'Épico',
  'legendario': 'Legendario',
  'legendaria': 'Legendario',
};

/**
 * Normaliza una cadena de rareza a su forma canónica con tilde.
 * Acepta variantes sin tilde, femeninas, etc.
 * @example normalizeRareza('Epica') → 'Épico'
 */
export function normalizeRareza(r: string): Rareza {
  if (!r) return 'Común';
  const key = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return RAREZA_MAP[key] ?? 'Común';
}
