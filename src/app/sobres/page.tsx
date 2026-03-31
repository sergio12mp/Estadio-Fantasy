'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { PackCard, PackType, Rarity, PACK_COSTS } from '@/lib/packs-types';

const RARITY_CONFIG: Record<Rarity, { gradient: string; border: string; badge: string; badgeText: string; stars: string; icon: string; label: string }> = {
  Comun:     { gradient: 'from-slate-500 via-slate-600 to-slate-700', border: 'border-slate-300', badge: 'bg-slate-100', badgeText: 'text-slate-700', stars: '★',    icon: '🧑‍⚽', label: 'Común'     },
  Rara:      { gradient: 'from-blue-500 via-blue-600 to-blue-800',    border: 'border-blue-400',  badge: 'bg-blue-100',  badgeText: 'text-blue-700',  stars: '★★',   icon: '🧑‍⚽', label: 'Rara'      },
  Epica:     { gradient: 'from-purple-600 via-purple-700 to-purple-900',border: 'border-purple-500',badge: 'bg-purple-100',badgeText: 'text-purple-700',stars: '★★★', icon: '🧑‍⚽', label: 'Épica'     },
  Legendaria:{ gradient: 'from-yellow-400 via-amber-500 to-orange-600',border: 'border-yellow-400',badge: 'bg-yellow-100',badgeText: 'text-yellow-700',stars: '★★★★',icon: '🧑‍⚽', label: 'Legendaria'},
};

const CardDisplay: React.FC<{ card: PackCard }> = ({ card }) => {
  const cfg = RARITY_CONFIG[card.rareza] ?? RARITY_CONFIG.Comun;
  const isObjeto = card.tipo === 'objeto';
  return (
    <div className={`rounded-xl overflow-hidden border-2 ${cfg.border} shadow-md flex flex-col`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-b ${cfg.gradient} px-2 pt-2 pb-8 relative`}>
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-white/80 bg-white/20 px-1.5 py-0.5 rounded-full capitalize">{card.tipo}</span>
          <span className="text-xs font-bold text-white/70">{cfg.stars}</span>
        </div>
        <div className="w-14 h-14 rounded-full mx-auto mt-1 bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl shadow-md">
          {isObjeto ? '🎯' : '⚽'}
        </div>
      </div>
      {/* Body */}
      <div className="bg-white flex-1 px-2 pt-2 pb-2 -mt-4 rounded-t-xl text-center">
        <p className="text-xs font-bold text-gray-900 leading-tight truncate">{card.nombre}</p>
        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge} ${cfg.badgeText}`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
};

const PACK_LABELS: Record<PackType, string> = {
  normal:  'Normal',
  jugador: 'Jugadores',
  objeto:  'Objetos',
};

export default function SobresPage() {
  const { manager, currency, setCurrency } = useAuth();
  const [pitty, setPitty] = useState(0);
  const [prob, setProb] = useState<Record<Rarity, number>>({
    Comun: 0,
    Rara: 0,
    Epica: 0,
    Legendaria: 0,
  });
  const [tipo, setTipo] = useState<PackType>('normal');
  const [resultado, setResultado] = useState<PackCard[] | null>(null);
  const [error, setError] = useState('');
  const [abriendo, setAbriendo] = useState(false);

  useEffect(() => {
    if (!manager) return;
    const cargar = async () => {
      const res = await fetch(`/api/sobres/abrir?managerId=${manager.idManager}`);
      if (res.ok) {
        const data = await res.json();
        setPitty(data.pitty);
        setProb(data.probabilidades);
      }
    };
    cargar();
  }, [manager]);

  const abrir = async (moneda: 'Oro' | 'Balones') => {
    if (!manager || abriendo) return;
    setError('');
    setResultado(null);
    setAbriendo(true);
    try {
      const res = await fetch('/api/sobres/abrir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: manager.idManager, tipo, moneda }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al abrir el sobre');
        return;
      }
      setResultado(data.cartas);
      setPitty(data.nuevaPitty);
      setProb(data.probabilidades);
      if (data.nuevaEconomia) setCurrency(data.nuevaEconomia);
    } finally {
      setAbriendo(false);
    }
  };

  const costs = PACK_COSTS[tipo];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Abrir Sobres</h1>

          {/* Saldo */}
          <div className="flex gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <span className="text-sm text-yellow-700">🪙 <strong>{currency.oro.toLocaleString()}</strong> oro</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <span className="text-sm text-blue-700">⚽ <strong>{currency.balones}</strong> balones</span>
            </div>
          </div>

          {/* Selector de tipo */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tipo de sobre</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(Object.keys(PACK_LABELS) as PackType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    tipo === t
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                  }`}
                >
                  {PACK_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => abrir('Balones')}
                disabled={abriendo || currency.balones < costs.balones}
                className="py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {abriendo ? 'Abriendo...' : `⚽ ${costs.balones} balones`}
              </button>
              <button
                onClick={() => abrir('Oro')}
                disabled={abriendo || currency.oro < costs.oro}
                className="py-3 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {abriendo ? 'Abriendo...' : `🪙 ${costs.oro} oro`}
              </button>
            </div>
          </div>

          {/* Pitty & probabilidades */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Pity: <span className="text-blue-600 font-bold">{pitty}</span><span className="text-gray-400">/50</span>
              </p>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((pitty / 50) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">Legendaria garantizada</span>
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
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {resultado && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">¡Cartas obtenidas!</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {resultado.map((c, idx) => (
                  <CardDisplay key={idx} card={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
