// src/lib/rareza-config.ts
// Fuente única de verdad para colores, gradientes y estilos por rareza.
// Importar desde aquí en lugar de redefinir en cada componente.

export type Rareza = 'Común' | 'Raro' | 'Épico' | 'Legendario';

export const RAREZA_STARS: Record<string, string> = {
  'Común':      '★',
  'Raro':       '★★',
  'Épico':      '★★★',
  'Legendario': '★★★★',
};

/** Configuración completa de estilos por rareza (usada en PlayerCard y AlbumPlayerCard) */
export const RAREZA_CONFIG: Record<string, {
  gradient:    string;
  border:      string;
  badge:       string;
  badgeText:   string;
  avatarBorder: string;
  starColor:   string;
}> = {
  'Común':      { gradient: 'from-slate-500 via-slate-600 to-slate-700',    border: 'border-slate-300',  badge: 'bg-slate-100 text-slate-600',   badgeText: 'text-slate-500',  avatarBorder: 'border-slate-300',  starColor: 'text-slate-400'  },
  'Raro':       { gradient: 'from-blue-500 via-blue-600 to-blue-800',        border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',     badgeText: 'text-blue-500',   avatarBorder: 'border-blue-300',   starColor: 'text-blue-400'   },
  'Épico':      { gradient: 'from-purple-600 via-purple-700 to-purple-900',  border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', badgeText: 'text-purple-500', avatarBorder: 'border-purple-300', starColor: 'text-purple-400' },
  'Legendario': { gradient: 'from-yellow-400 via-amber-500 to-orange-600',   border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-700', badgeText: 'text-yellow-600', avatarBorder: 'border-yellow-300', starColor: 'text-yellow-400' },
};

/** Colores de badge para rareza (usados en modales de selección) */
export const RAREZA_BADGE: Record<string, string> = {
  'Común':      'bg-slate-200 text-slate-700 border-slate-400',
  'Raro':       'bg-blue-100 text-blue-700 border-blue-400',
  'Épico':      'bg-purple-100 text-purple-700 border-purple-400',
  'Legendario': 'bg-yellow-100 text-yellow-700 border-yellow-400',
};

/** Gradientes de fondo por rareza */
export const RAREZA_GRADIENT: Record<string, string> = {
  'Común':      'from-slate-500 via-slate-600 to-slate-700',
  'Raro':       'from-blue-500 via-blue-600 to-blue-800',
  'Épico':      'from-purple-600 via-purple-700 to-purple-900',
  'Legendario': 'from-yellow-400 via-amber-500 to-orange-600',
};

/** Bordes por rareza */
export const RAREZA_BORDER: Record<string, string> = {
  'Común':      'border-slate-300',
  'Raro':       'border-blue-400',
  'Épico':      'border-purple-500',
  'Legendario': 'border-yellow-400',
};

/** Colores de objetos equipados por rareza */
export const RAREZA_OBJETO_COLORS: Record<string, string> = {
  'Común':      'bg-slate-200 border-slate-400 text-slate-700',
  'Raro':       'bg-blue-100 border-blue-400 text-blue-700',
  'Épico':      'bg-purple-100 border-purple-500 text-purple-700',
  'Legendario': 'bg-yellow-100 border-yellow-500 text-yellow-700',
};

/** Colores de fondo en modal de selección de objetos */
export const RAREZA_OBJETO_BG: Record<string, string> = {
  'Común':      'border-gray-300 bg-gray-50',
  'Raro':       'border-blue-400 bg-blue-50',
  'Épico':      'border-purple-500 bg-purple-50',
  'Legendario': 'border-yellow-500 bg-yellow-50',
};

/** Orden numérico de rareza (para ordenar listas) */
export const RAREZA_ORDEN: Record<string, number> = {
  'Común': 0, 'Raro': 1, 'Épico': 2, 'Legendario': 3,
};

/** Icono por rareza para cartas de objeto */
export const RAREZA_ICON: Record<string, string> = {
  'Común':      '🎯',
  'Raro':       '🛡️',
  'Épico':      '⚡',
  'Legendario': '👑',
};
