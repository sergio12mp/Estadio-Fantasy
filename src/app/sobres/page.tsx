'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { PackCard, PackType, Rarity, PACK_COSTS } from '@/lib/packs-types';

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

  const [error, setError] = useState('');

  const abrir = async (moneda: 'Oro' | 'Balones') => {
    if (!manager) return;
    setError('');
    const res = await fetch('/api/sobres/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId: manager.idManager, tipo, moneda }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error');
      return;
    }
    setResultado(data.cartas);
    setPitty(data.nuevaPitty);
    setProb(data.probabilidades);
    if (data.nuevaEconomia) setCurrency(data.nuevaEconomia);
  };

  return (
    <RequireAuth>
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Abrir sobres</h1>
        <p className="mb-2">Oro: {currency.oro} · Balones: {currency.balones}</p>
        <div className="mb-4">
          <label className="mr-2">Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as PackType)} className="text-black dark:text-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1">
            <option value="normal">Normal</option>
            <option value="jugador">Jugadores</option>
            <option value="objeto">Objetos</option>
          </select>
          <div className="mt-2 flex gap-2">
            <button onClick={() => abrir('Balones')} className="px-4 py-2 bg-blue-600 text-white rounded">
              Abrir con Balones ({PACK_COSTS[tipo].balones})
            </button>
            <button onClick={() => abrir('Oro')} className="px-4 py-2 bg-yellow-600 text-white rounded">
              Abrir con Oro ({PACK_COSTS[tipo].oro})
            </button>
          </div>
        </div>
        <div className="mb-4 text-sm">
          <p>Pitty actual: {pitty}</p>
          <p>Probabilidades:</p>
          <ul>
            {Object.entries(prob).map(([r, v]) => (
              <li key={r}>{r}: {(v * 100).toFixed(1)}%</li>
            ))}
          </ul>
        </div>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {resultado && (
          <div>
            <h2 className="font-semibold mb-2">Cartas obtenidas:</h2>
            <ul className="list-disc pl-5">
              {resultado.map((c, idx) => (
                <li key={idx}>{c.tipo} - {c.nombre} ({c.rareza})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
