'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { CartaJugadorManager, CartaObjetoManager } from '@/lib/data';

interface Carta extends Partial<CartaJugadorManager>, Partial<CartaObjetoManager> {
  tipo: 'jugador' | 'objeto';
  Rareza: string;
  Nombre: string;
  NombreEquipo?: string;
  id: number;
}

export default function AlbumPage() {
  const { manager, currency, setCurrency } = useAuth();
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroRareza, setFiltroRareza] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargar = async () => {
      if (!manager) return;
      const resJug = await fetch(`/api/cartas-manager?managerId=${manager.idManager}`);
      const dataJug = await resJug.json();
      const resObj = await fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`);
      const dataObj = await resObj.json();
      const combinadas: Carta[] = [
        ...dataJug.cartasJugador.map((c: CartaJugadorManager) => ({
          tipo: 'jugador',
          Rareza: c.Rareza,
          Nombre: c.NombreJugador,
          NombreEquipo: c.NombreEquipo,
          id: c.idCartaJugador,
        })),
        ...dataObj.cartasObjeto.map((c: CartaObjetoManager) => ({
          tipo: 'objeto',
          Rareza: c.Rareza,
          Nombre: c.NombreObjeto,
          id: c.idCartaObjeto,
        })),
      ];
      setCartas(combinadas);
    };
    cargar();
  }, [manager]);

  const eliminarCarta = async (carta: Carta) => {
    if (!manager) return;
    setMensaje('');
    const res = await fetch(
      `/api/cartas/${carta.tipo}/${carta.id}?managerId=${manager.idManager}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (!res.ok) {
      setMensaje(data.error || 'Error');
      return;
    }
    setCartas((prev) => prev.filter((c) => c.id !== carta.id));
    const bal = data.balonesGanados || 0;
    setCurrency({ ...currency, balones: currency.balones + bal });
  };

  const cartasFiltradas = cartas.filter((c) => {
    if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
    if (filtroRareza !== 'todas' && c.Rareza !== filtroRareza) return false;
    if (busqueda && !c.Nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <RequireAuth>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Álbum de cartas</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="text-black">
            <option value="todos">Todos</option>
            <option value="jugador">Jugadores</option>
            <option value="objeto">Objetos</option>
          </select>
          <select value={filtroRareza} onChange={(e) => setFiltroRareza(e.target.value)} className="text-black">
            <option value="todas">Todas</option>
            <option value="Común">Común</option>
            <option value="Raro">Raro</option>
            <option value="Épico">Épico</option>
            <option value="Legendario">Legendario</option>
          </select>
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-2 text-black"
          />
        </div>
        {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}
        <ul className="list-disc pl-5">
          {cartasFiltradas.map((c, idx) => (
            <li key={idx} className="mb-1">
              {c.tipo} - {c.Nombre} ({c.Rareza}) {c.NombreEquipo && `- ${c.NombreEquipo}`}
              {!(c.tipo === 'jugador' && c.Rareza === 'Común') && (
                <button
                  className="ml-2 text-sm text-red-600"
                  onClick={() => eliminarCarta(c)}
                >
                  Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </RequireAuth>
  );
}
