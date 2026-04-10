// src/components/RarityBadge.tsx
// Badge de rareza reutilizable. Muestra el nombre de la rareza con sus colores y opcionalmente estrellas.

import React from 'react';
import { RAREZA_CONFIG, RAREZA_STARS } from '@/lib/rareza-config';

interface RarityBadgeProps {
  rareza: string;
  showStars?: boolean;
  className?: string;
}

export default function RarityBadge({ rareza, showStars = false, className = '' }: RarityBadgeProps) {
  const config = RAREZA_CONFIG[rareza] ?? RAREZA_CONFIG['Común'];
  const stars = RAREZA_STARS[rareza] ?? '★';

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge} ${className}`}>
      {rareza}{showStars ? ` ${stars}` : ''}
    </span>
  );
}
