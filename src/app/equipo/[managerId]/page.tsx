'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import RequireAuth from '@/components/RequireAuth';
import PlayerCard from '@/components/playerCard';
import {
  CartaJugadorEnPlantilla,
  getPosicionFrontend,
  PosicionFrontend,
  obtenerSlotsObjetoPorRareza,
} from '@/lib/data';

const RAREZA_MAP: Record<string, 'Común' | 'Raro' | 'Épico' | 'Legendario'> = {
  comun: 'Común', común: 'Común',
  raro: 'Raro', rara: 'Raro',
  epico: 'Épico', epica: 'Épico', épico: 'Épico', épica: 'Épico',
  legendario: 'Legendario', legendaria: 'Legendario',
};

function normalizeRareza(r: string): 'Común' | 'Raro' | 'Épico' | 'Legendario' {
  if (!r) return 'Común';
  const key = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return RAREZA_MAP[key] ?? 'Común';
}

function EquipoContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const managerId = Number(params.managerId);
  const nombreParam = searchParams.get('nombre') ?? `Manager #${managerId}`;

  const [jornadas, setJornadas] = useState<{ idJornada: number; Nombre: string }[]>([]);
  const [jornadaActualId, setJornadaActualId] = useState<number | null>(null);
  const [selectedJornada, setSelectedJornada] = useState<number | null>(null);

  const [plantilla, setPlantilla] = useState<Map<number, CartaJugadorEnPlantilla>>(new Map());
  const [alineacion, setAlineacion] = useState<string>('4-3-3');
  const [puntos, setPuntos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorPlantilla, setErrorPlantilla] = useState<string | null>(null);

  // Cargar jornadas disponibles para este manager
  useEffect(() => {
    if (!managerId) return;
    async function init() {
      try {
        const [confRes, dispRes] = await Promise.all([
          fetch('/api/config/jornada-actual'),
          fetch(`/api/plantilla/disponibles?managerId=${managerId}`),
        ]);
        const confData = confRes.ok ? await confRes.json() : null;
        const dispData = dispRes.ok ? await dispRes.json() : null;

        const idActual: number = confData?.idJornada ?? null;
        setJornadaActualId(idActual);

        const lista: { idJornada: number; Nombre: string }[] = dispData?.jornadas ?? [];
        setJornadas(lista);
        // Seleccionar la jornada más reciente disponible
        if (lista.length > 0) {
          setSelectedJornada(lista[0].idJornada);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [managerId]);

  // Cargar plantilla cuando cambia la jornada seleccionada
  useEffect(() => {
    if (!managerId || selectedJornada === null) return;

    async function fetchPlantilla() {
      setErrorPlantilla(null);
      setPuntos(null);
      try {
        const res = await fetch(`/api/plantilla?managerId=${managerId}&idJornada=${selectedJornada}`);
        if (!res.ok) {
          setPlantilla(new Map());
          setErrorPlantilla('No hay plantilla guardada para esta jornada.');
          return;
        }
        const data = await res.json();
        const jugadores = Array.isArray(data.jugadoresEnCampo) ? data.jugadoresEnCampo : [];
        const map = new Map<number, CartaJugadorEnPlantilla>();
        jugadores.forEach((jug: any) => {
          if (!jug) return;
          const rarezaNorm = normalizeRareza(jug.Rareza ?? '');
          map.set(jug.posicionEnPlantilla, {
            ...jug,
            Rareza: rarezaNorm,
            Edad: jug.Edad?.split('-')[0] ?? jug.Edad ?? '',
            objetosEquipados: jug.objetosEquipados || [],
            maxObjetosSlots: obtenerSlotsObjetoPorRareza(rarezaNorm),
          });
        });
        if (data.plantilla?.Alineacion) setAlineacion(data.plantilla.Alineacion);
        setPuntos(data.plantilla?.Puntos ?? null);
        setPlantilla(map);
      } catch (e) {
        console.error(e);
        setErrorPlantilla('Error al cargar la plantilla.');
      }
    }
    fetchPlantilla();
  }, [managerId, selectedJornada]);

  const FORMACIONES: Record<string, { [k in PosicionFrontend]: number }> = {
    '5-4-1': { POR: 1, DEF: 5, MED: 4, DEL: 1 },
    '5-3-2': { POR: 1, DEF: 5, MED: 3, DEL: 2 },
    '4-5-1': { POR: 1, DEF: 4, MED: 5, DEL: 1 },
    '4-4-2': { POR: 1, DEF: 4, MED: 4, DEL: 2 },
    '4-3-3': { POR: 1, DEF: 4, MED: 3, DEL: 3 },
    '3-5-2': { POR: 1, DEF: 3, MED: 5, DEL: 2 },
    '3-4-3': { POR: 1, DEF: 3, MED: 4, DEL: 3 },
  };
  const ORDER: PosicionFrontend[] = ['POR', 'DEF', 'MED', 'DEL'];
  const formation = FORMACIONES[alineacion] ?? FORMACIONES['4-3-3'];

  const campo = useMemo(() => {
    const rows: React.ReactElement[] = [];
    let idx = 0;
    for (const pos of ORDER) {
      const count = formation[pos];
      const slots: React.ReactElement[] = [];
      for (let i = 0; i < count; i++) {
        const p = plantilla.get(idx);
        slots.push(
          <div key={idx} className="relative w-44 m-1">
            {p ? (
              <PlayerCard carta={p} fieldMode />
            ) : (
              <div className="flex flex-col items-center gap-1 py-4 rounded-lg border border-white/20 bg-white/5">
                <span className="text-white/40 text-xs font-bold">{pos}</span>
              </div>
            )}
          </div>
        );
        idx++;
      }
      rows.push(
        <div key={`row-${pos}`} className="flex justify-center mb-4">
          {slots}
        </div>
      );
    }
    return rows;
  }, [plantilla, formation]);

  if (loading) {
    return <div className="text-center text-white text-xl mt-20">Cargando...</div>;
  }

  const jornadaActualNombre = jornadas.find(j => j.idJornada === selectedJornada)?.Nombre ?? `Jornada ${selectedJornada}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-[76px]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{nombreParam}</h1>
            {puntos != null && (
              <p className="text-yellow-400 font-semibold mt-1">
                {jornadaActualNombre}: <span className="text-2xl">{puntos}</span> pts
              </p>
            )}
          </div>
          {jornadas.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Jornada</label>
              <select
                className="bg-gray-700 border border-gray-500 rounded-lg px-4 py-2 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
                value={selectedJornada ?? ''}
                onChange={(e) => setSelectedJornada(parseInt(e.target.value))}
              >
                {jornadas.map((j) => (
                  <option key={j.idJornada} value={j.idJornada}>
                    {j.Nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mb-2 text-center text-gray-400 text-sm">
          Alineación: <span className="font-semibold text-white">{alineacion}</span>
        </div>

        {jornadas.length === 0 ? (
          <div className="text-center text-gray-400 mt-12 bg-gray-800 rounded-xl p-8">
            <p className="text-lg">Este manager no tiene plantillas guardadas aún.</p>
          </div>
        ) : errorPlantilla ? (
          <div className="text-center text-gray-400 mt-12 bg-gray-800 rounded-xl p-8">
            <p className="text-lg">{errorPlantilla}</p>
          </div>
        ) : (
          <div
            className="relative rounded-2xl overflow-hidden border-4 border-green-600/40"
            style={{
              background: 'repeating-linear-gradient(to bottom, #166534, #166534 60px, #15803d 60px, #15803d 120px)',
            }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/20" />
            <div className="py-6 px-4">{campo}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EquipoPage() {
  return (
    <RequireAuth>
      <EquipoContent />
    </RequireAuth>
  );
}
