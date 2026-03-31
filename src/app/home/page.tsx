"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";

type Partido = {
  idPartido: number;
  idJornada: number;
  NombreLocal: string;
  NombreVisitante: string;
};

type JornadaInfo = {
  idJornada: number;
  Nombre: string;
};

type TopManager = {
  idManager: number;
  nombreManager: string;
  puntuacion_actual: number;
};

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${color}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const HomeContent = () => {
  const { manager, currency } = useAuth();

  const [jornadaActual, setJornadaActual] = useState<JornadaInfo | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [top, setTop] = useState<TopManager[]>([]);
  const [loadingPartidos, setLoadingPartidos] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);

  // Cargar jornada actual y sus partidos
  useEffect(() => {
    const fetchJornada = async () => {
      try {
        const ultimaRes = await fetch("/api/jornada/ultima");
        if (!ultimaRes.ok) return;
        const { idJornada } = await ultimaRes.json();

        const jornadaRes = await fetch(`/api/jornada/${idJornada}`);
        const jornadaData = await jornadaRes.json();
        if (jornadaRes.ok && Array.isArray(jornadaData.result) && jornadaData.result[0]) {
          setJornadaActual(jornadaData.result[0]);
        }

        const partidosRes = await fetch(`/api/partido?idJornada=${idJornada}`);
        if (partidosRes.ok) {
          const data = await partidosRes.json();
          setPartidos(Array.isArray(data.partidos) ? data.partidos.slice(0, 6) : []);
        }
      } catch (e) {
        console.error("Error cargando jornada:", e);
      } finally {
        setLoadingPartidos(false);
      }
    };
    fetchJornada();
  }, []);

  // Cargar top de la liga general
  useEffect(() => {
    const fetchTop = async () => {
      try {
        const ligasRes = await fetch(`/api/ligas/mis-ligas?managerId=${manager?.idManager}`);
        if (!ligasRes.ok) return;
        const ligasData = await ligasRes.json();
        const general = (ligasData.ligas as any[])?.find((l: any) => l.tipo === "general");
        if (!general) return;

        const clsRes = await fetch(`/api/ligas/${general.idLigas}/clasificacion`);
        if (!clsRes.ok) return;
        const clsData = await clsRes.json();
        setTop((clsData.clasificacion ?? []).slice(0, 5));
      } catch (e) {
        console.error("Error cargando clasificación:", e);
      } finally {
        setLoadingTop(false);
      }
    };
    if (manager?.idManager) fetchTop();
  }, [manager]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Bienvenido, {manager?.nombre ?? "Manager"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {jornadaActual ? `Jornada actual: ${jornadaActual.Nombre}` : "Cargando jornada..."}
          </p>
        </div>

        {/* Stats del manager */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Oro" value={currency.oro.toLocaleString()} icon="🪙" color="border-yellow-400" />
          <StatCard label="Balones" value={currency.balones} icon="⚽" color="border-blue-400" />
          <StatCard label="Puntos totales" value={manager?.puntuacion_actual ?? 0} icon="⭐" color="border-green-400" />
          <StatCard label="Jornada" value={jornadaActual?.idJornada ?? "—"} icon="📅" color="border-purple-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Partidos de la jornada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Partidos de la jornada
            </h2>
            {loadingPartidos ? (
              <p className="text-gray-400 text-sm">Cargando partidos...</p>
            ) : partidos.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay partidos disponibles.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {partidos.map((p) => (
                  <li key={p.idPartido} className="py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate w-2/5 text-right">
                      {p.NombreLocal}
                    </span>
                    <span className="text-xs font-bold text-gray-400 mx-2">vs</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate w-2/5">
                      {p.NombreVisitante}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Clasificación liga general */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Liga General — Top 5
            </h2>
            {loadingTop ? (
              <p className="text-gray-400 text-sm">Cargando clasificación...</p>
            ) : top.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin datos de clasificación aún.</p>
            ) : (
              <ol className="space-y-2">
                {top.map((m, i) => (
                  <li
                    key={m.idManager}
                    className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                      m.idManager === manager?.idManager
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-bold w-6 text-center ${
                          i === 0
                            ? "text-yellow-500"
                            : i === 1
                            ? "text-gray-400"
                            : i === 2
                            ? "text-amber-700"
                            : "text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {m.nombreManager}
                        {m.idManager === manager?.idManager && (
                          <span className="ml-2 text-xs text-blue-600">(tú)</span>
                        )}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{m.puntuacion_actual} pts</span>
                  </li>
                ))}
              </ol>
            )}
            <Link
              href="/ligas"
              className="block mt-4 text-center text-sm text-blue-600 hover:underline"
            >
              Ver todas las ligas →
            </Link>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { href: "/mi-equipo", label: "Mi Equipo", icon: "🧑‍🤝‍🧑" },
            { href: "/sobres", label: "Abrir Sobres", icon: "📦" },
            { href: "/album", label: "Álbum", icon: "📒" },
            { href: "/ligas", label: "Ligas", icon: "🏆" },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
