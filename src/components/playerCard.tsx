// src/components/playerCard.tsx
import React from 'react';
import { CartaJugadorEnPlantilla, ObjetoEquipado } from '@/lib/data';

interface PlayerCardProps {
  carta: CartaJugadorEnPlantilla;
  onEquipObject?: () => void;
  onClick?: () => void;
  fieldMode?: boolean;
}

const RAREZA_CONFIG: Record<string, {
  gradient: string;
  border: string;
  badge: string;
  badgeText: string;
  avatarBorder: string;
  starColor: string;
}> = {
  'Común':      { gradient: 'from-slate-500 via-slate-600 to-slate-700', border: 'border-slate-300', badge: 'bg-slate-100 text-slate-600', badgeText: 'text-slate-500', avatarBorder: 'border-slate-300', starColor: 'text-slate-400' },
  'Raro':       { gradient: 'from-blue-500 via-blue-600 to-blue-800',    border: 'border-blue-400',  badge: 'bg-blue-100 text-blue-700',  badgeText: 'text-blue-500',  avatarBorder: 'border-blue-300',  starColor: 'text-blue-400'  },
  'Épico':      { gradient: 'from-purple-600 via-purple-700 to-purple-900', border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', badgeText: 'text-purple-500', avatarBorder: 'border-purple-300', starColor: 'text-purple-400' },
  'Legendario': { gradient: 'from-yellow-400 via-amber-500 to-orange-600', border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-700', badgeText: 'text-yellow-600', avatarBorder: 'border-yellow-300', starColor: 'text-yellow-400' },
};

const RAREZA_STARS: Record<string, string> = {
  'Común': '★',
  'Raro': '★★',
  'Épico': '★★★',
  'Legendario': '★★★★',
};

const PlayerCard: React.FC<PlayerCardProps> = ({ carta, onEquipObject, onClick, fieldMode }) => {
  if (!carta) return null;

  const config = RAREZA_CONFIG[carta.Rareza] ?? RAREZA_CONFIG['Común'];
  const stars = RAREZA_STARS[carta.Rareza] ?? '★';
  const objetosEquipados = carta.objetosEquipados || [];
  const maxObjetosSlots = carta.maxObjetosSlots || 0;
  const inicial = carta.Nombre ? carta.Nombre.charAt(0).toUpperCase() : '?';

  const rarezaObjColors: Record<string, string> = {
    'Común': 'bg-slate-200 border-slate-400',
    'Raro': 'bg-blue-100 border-blue-400',
    'Épico': 'bg-purple-100 border-purple-500',
    'Legendario': 'bg-yellow-100 border-yellow-500',
  };

  if (fieldMode) {
    return (
      <div
        className={`rounded-lg overflow-hidden border-2 ${config.border} shadow-sm w-full
          ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200' : ''}`}
        onClick={onClick}
      >
        {/* Compact gradient header */}
        <div className={`bg-gradient-to-r ${config.gradient} px-2 py-1.5 flex items-center gap-1.5`}>
          <div className={`w-7 h-7 rounded-full border-2 ${config.avatarBorder} bg-white/20 flex items-center justify-center text-white text-xs font-extrabold shrink-0 select-none`}>
            {inicial}
          </div>
          <span className="text-[10px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">
            {carta.PosicionFrontend}
          </span>
          <span className={`text-[10px] font-bold ${config.starColor} drop-shadow ml-auto`}>{stars}</span>
        </div>
        {/* Body */}
        <div className="bg-white dark:bg-gray-800 px-2 pt-1 pb-1.5">
          <p className="font-bold text-gray-900 dark:text-gray-100 text-xs leading-tight truncate">{carta.Nombre}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{carta.NombreEquipo}</p>
          {carta.PuntosJornada != null && (
            <div className="inline-flex items-center gap-0.5 mt-0.5">
              <span className="text-amber-500 text-[10px]">⭐</span>
              <span className="text-[10px] font-bold text-amber-700">{carta.PuntosJornada}pts</span>
            </div>
          )}
          {maxObjetosSlots > 0 && (
            <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-1 mb-1">
                {Array.from({ length: maxObjetosSlots }).map((_, i) => {
                  const obj = objetosEquipados[i];
                  const rNorm = obj?.Rareza
                    ? (['Común','Raro','Épico','Legendario'].includes(obj.Rareza) ? obj.Rareza : 'Común')
                    : 'Común';
                  return obj ? (
                    <div key={i} title={obj.Nombre} className={`w-4 h-4 rounded border flex items-center justify-center text-[8px] ${rarezaObjColors[rNorm] ?? 'bg-gray-100 border-gray-300'}`}>
                      🎯
                    </div>
                  ) : (
                    <div key={i} className="w-4 h-4 border border-dashed border-gray-300 dark:border-gray-600 rounded" />
                  );
                })}
              </div>
              {onEquipObject && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEquipObject(); }}
                  className="w-full py-0.5 bg-purple-600 text-white text-[9px] rounded hover:bg-purple-700 transition-colors font-medium"
                >
                  {objetosEquipados.length > 0 ? '✏️ Obj' : '+ Obj'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden border-2 ${config.border} shadow-md flex flex-col w-full h-full
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-b ${config.gradient} px-3 pt-3 pb-10 relative`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-white/90 uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
            {carta.PosicionFrontend}
          </span>
          <span className={`text-xs font-bold ${config.starColor} drop-shadow`}>{stars}</span>
        </div>
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full mx-auto mt-1 border-4 ${config.avatarBorder} bg-white/20 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg backdrop-blur-sm select-none`}>
          {inicial}
        </div>
      </div>

      {/* White body that overlaps header */}
      <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col px-3 pt-3 pb-2 -mt-5 rounded-t-2xl">
        {/* Name */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm leading-tight truncate">{carta.Nombre}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-400 text-center mb-1 truncate">{carta.NombreEquipo}</p>

        {/* Rarity badge */}
        <div className="flex justify-center mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
            {carta.Rareza}
          </span>
        </div>

        {/* Points */}
        <div className="text-center mb-2">
          {carta.PuntosJornada != null ? (
            <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1">
              <span className="text-amber-500 text-xs">⭐</span>
              <span className="text-xs font-bold text-amber-700">{carta.PuntosJornada} pts</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Sin puntos aún</span>
          )}
        </div>

        {/* Meta info */}
        <div className="text-xs text-gray-400 text-center space-y-0.5 mb-2">
          <p>{carta.Pais}{carta.Edad ? ` · ${carta.Edad} años` : ''}</p>
        </div>

        {/* Objects section */}
        {maxObjetosSlots > 0 && (
          <div className="mt-auto pt-1 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-1 mb-1">
              {Array.from({ length: maxObjetosSlots }).map((_, i) => {
                const obj = objetosEquipados[i];
                const rarezaColors: Record<string, string> = {
                  'Común': 'bg-slate-200 border-slate-400 text-slate-700',
                  'Raro': 'bg-blue-100 border-blue-400 text-blue-700',
                  'Épico': 'bg-purple-100 border-purple-500 text-purple-700',
                  'Legendario': 'bg-yellow-100 border-yellow-500 text-yellow-700',
                };
                const rNorm = obj?.Rareza ? (
                  (['Común','Raro','Épico','Legendario'].includes(obj.Rareza) ? obj.Rareza : 'Común')
                ) : 'Común';
                return obj ? (
                  <div
                    key={i}
                    title={obj.Nombre}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold leading-tight max-w-full ${rarezaColors[rNorm] ?? 'bg-gray-100 border-gray-300 text-gray-600'}`}
                  >
                    <span>🎯</span>
                    <span className="truncate max-w-[60px]">{obj.Nombre}</span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="w-5 h-5 border border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center"
                  >
                    <span className="text-[9px] text-gray-300">+</span>
                  </div>
                );
              })}
            </div>
            {onEquipObject && (
              <button
                onClick={(e) => { e.stopPropagation(); onEquipObject(); }}
                className="w-full py-1 bg-purple-600 text-white text-[10px] rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {objetosEquipados.length > 0 ? '✏️ Objetos' : '+ Equipar'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
