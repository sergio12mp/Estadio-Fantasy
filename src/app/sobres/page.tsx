'use client';

import RequireAuth from '@/components/ui/RequireAuth';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/auth-context';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { PackCard, PackType, Rarity, PACK_COSTS } from '@/lib/packs-types';
import { cn } from '@/lib/utils';
import { getPlayerImageUrl } from '@/lib/player-image';

const RARITY_CONFIG: Record<Rarity, {
  gradient: string; border: string; badge: string; badgeText: string;
  stars: string; label: string; glow: string;
}> = {
  Comun:     { gradient: 'from-slate-500 to-slate-700',     border: 'border-slate-400',  badge: 'bg-slate-100',  badgeText: 'text-slate-700',  stars: '★',     label: 'Común',      glow: '' },
  Rara:      { gradient: 'from-blue-500 to-blue-800',       border: 'border-blue-400',   badge: 'bg-blue-100',   badgeText: 'text-blue-700',   stars: '★★',    label: 'Rara',       glow: 'shadow-blue-400/50' },
  Epica:     { gradient: 'from-purple-600 to-purple-900',   border: 'border-purple-500', badge: 'bg-purple-100', badgeText: 'text-purple-700', stars: '★★★',   label: 'Épica',      glow: 'shadow-purple-400/60' },
  Legendaria:{ gradient: 'from-yellow-400 to-orange-600',   border: 'border-yellow-400', badge: 'bg-yellow-100', badgeText: 'text-yellow-700', stars: '★★★★',  label: 'Legendaria', glow: 'shadow-yellow-400/70' },
};

const PACK_LABELS: Record<PackType, { label: string; desc: string; icon: string }> = {
  normal:  { label: 'Normal',     desc: '3 jug + 1-2 obj', icon: '📦' },
  jugador: { label: 'Jugadores',  desc: '5 jugadores',     icon: '⚽' },
  objeto:  { label: 'Objetos',    desc: '5 objetos',       icon: '🎯' },
};

const POSICION_LABEL: Record<string, string> = {
  Portero: 'POR', Delantero: 'DEL', Defensa: 'DEF', Centrocampista: 'MED',
  Por: 'POR', Del: 'DEL', Def: 'DEF', Med: 'MED',
};

function posLabel(pos?: string): string {
  if (!pos) return '';
  return POSICION_LABEL[pos] ?? pos.substring(0, 3).toUpperCase();
}

const CardDisplay: React.FC<{ card: PackCard; revealed: boolean }> = ({ card, revealed }) => {
  const cfg = RARITY_CONFIG[card.rareza] ?? RARITY_CONFIG.Comun;
  const isJugador = card.tipo === 'jugador';
  const imageUrl = isJugador ? getPlayerImageUrl(card.slug, 64, card.idDB) : null;
  const [imgError, setImgError] = useState(false);
  const inicial = card.nombre.charAt(0).toUpperCase();

  return (
    <div className={cn(
      'rounded-xl overflow-hidden border-2 flex flex-col transition-all duration-500',
      cfg.border,
      cfg.glow ? `shadow-lg ${cfg.glow}` : 'shadow-md',
      revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95',
    )}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-b ${cfg.gradient} px-2 pt-3 pb-8 relative`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full">
            {isJugador ? (posLabel(card.posicion) || 'JUG') : 'OBJ'}
          </span>
          <span className={cn(
            'text-xs font-bold',
            card.rareza === 'Legendaria' ? 'text-yellow-200' : 'text-white/80'
          )}>{cfg.stars}</span>
        </div>
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full mx-auto mt-1 bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shadow-lg">
          {isJugador && imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={card.nombre}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-white text-2xl font-extrabold select-none">
              {isJugador ? inicial : '🎯'}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white dark:bg-gray-800 flex-1 px-2 pt-2 pb-2 -mt-4 rounded-t-xl text-center">
        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
          {card.nombre}
        </p>
        {card.equipo && (
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{card.equipo}</p>
        )}
        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge} ${cfg.badgeText}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
};

export default function SobresPage() {
  const { manager, currency, setCurrency } = useAuth();
  const [pitty, setPitty] = useState(0);
  const [prob, setProb] = useState<Record<Rarity, number>>({ Comun: 0, Rara: 0, Epica: 0, Legendaria: 0 });
  const [tipo, setTipo] = useState<PackType>('normal');
  const [resultado, setResultado] = useState<PackCard[] | null>(null);
  const [error, setError] = useState('');
  const [abriendo, setAbriendo] = useState(false);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!manager) return;
    fetch(`/api/sobres/abrir?managerId=${manager.idManager}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setPitty(data.pitty); setProb(data.probabilidades); } });
  }, [manager]);

  const abrir = async (moneda: 'Oro' | 'Balones') => {
    if (!manager || abriendo) return;
    setError('');
    setResultado(null);
    setRevealedCards([]);
    setAbriendo(true);
    try {
      const res = await fetch('/api/sobres/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: manager.idManager, tipo, moneda }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al abrir el sobre'); return; }
      setResultado(data.cartas);
      setPitty(data.nuevaPitty);
      setProb(data.probabilidades);
      if (data.nuevaEconomia) setCurrency(data.nuevaEconomia);
      // Reveal cards one by one
      data.cartas.forEach((_: PackCard, i: number) => {
        setTimeout(() => {
          setRevealedCards(prev => { const next = [...prev]; next[i] = true; return next; });
        }, i * 150);
      });
      // Scroll to results
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } finally {
      setAbriendo(false);
    }
  };

  const costs = PACK_COSTS[tipo];
  const hasLegendaria = resultado?.some(c => c.rareza === 'Legendaria');

  return (
    <RequireAuth>
      <PageLayout centered>
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-4 text-gray-900 dark:text-gray-100">
          Abrir Sobres
        </h1>

        {/* Saldo */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-0.5">Oro</p>
            <p className="font-bold text-yellow-800 dark:text-yellow-300">🪙 {currency.oro.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Balones</p>
            <p className="font-bold text-blue-800 dark:text-blue-300">⚽ {currency.balones.toLocaleString()}</p>
          </div>
        </div>

        {/* Selector de tipo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tipo de sobre</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(Object.keys(PACK_LABELS) as PackType[]).map((t) => {
              const { label, desc, icon } = PACK_LABELS[t];
              return (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    'py-2.5 px-2 rounded-xl text-center border-2 transition-all',
                    tipo === t
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                  )}
                >
                  <span className="text-xl block">{icon}</span>
                  <span className={cn('text-xs font-semibold block mt-0.5', tipo === t ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300')}>{label}</span>
                  <span className={cn('text-[10px] block', tipo === t ? 'text-blue-500' : 'text-gray-400')}>{desc}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => abrir('Balones')}
              disabled={abriendo || currency.balones < costs.balones}
              className="py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              {abriendo ? '⏳ Abriendo...' : `⚽ ${costs.balones} balones`}
            </button>
            <button
              onClick={() => abrir('Oro')}
              disabled={abriendo || currency.oro < costs.oro}
              className="py-3.5 px-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              {abriendo ? '⏳ Abriendo...' : `🪙 ${costs.oro} oro`}
            </button>
          </div>
        </div>

        {/* Pitty & probabilidades */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Pity <span className="text-blue-600 dark:text-blue-400 font-bold">{pitty}/50</span>
            </span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((pitty / 50) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">🌟 garantizada</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(prob) as [Rarity, number][]).map(([r, v]) => {
              const cfg = RARITY_CONFIG[r];
              return (
                <div key={r} className={`rounded-lg px-3 py-2 border ${cfg.border} ${cfg.badge} flex justify-between items-center`}>
                  <span className={`text-xs font-semibold ${cfg.badgeText}`}>{cfg.label}</span>
                  <span className={`text-xs font-bold ${cfg.badgeText}`}>{(v * 100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div ref={resultRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {hasLegendaria ? '🌟 ¡Legendaria!' : '¡Cartas obtenidas!'}
              </h2>
              {hasLegendaria && (
                <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full font-semibold">
                  LEGENDARIA
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {resultado.map((c, idx) => (
                <CardDisplay key={idx} card={c} revealed={revealedCards[idx] ?? false} />
              ))}
            </div>
            <button
              onClick={() => { setResultado(null); setRevealedCards([]); }}
              className="mt-4 w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cerrar resultado
            </button>
          </div>
        )}
      </PageLayout>
    </RequireAuth>
  );
}
