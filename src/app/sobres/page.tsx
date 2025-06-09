'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { PackCard, PackType, Rarity, PACK_COSTS } from '@/lib/packs';

export default function SobresPage() {
  const { manager } = useAuth();
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

  const abrir = async () => {
    if (!manager) return;
    const res = await fetch('/api/sobres/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId: manager.idManager, tipo }),
    });
    const data = await res.json();
    setResultado(data.cartas);
    setPitty(data.nuevaPitty);
    setProb(data.probabilidades);
  };

  return (
    <RequireAuth>
      <div className="p-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Abrir sobres</h1>
        <div className="mb-4">
          <label className="mr-2">Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as PackType)} className="text-black">
            <option value="normal">Normal</option>
            <option value="jugador">Jugadores</option>
            <option value="objeto">Objetos</option>
          </select>
          <button onClick={abrir} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">Abrir</button>
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
        {resultado && (
          <div>
            <h2 className="font-semibold mb-2">Cartas obtenidas:</h2>
            <ul className="list-disc pl-5">
              {resultado.map((c, idx) => (
                <li key={idx}>{c.tipo} - {c.rareza}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
