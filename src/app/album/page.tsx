'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useMemo } from 'react';
import { CartaJugadorManager, CartaObjetoManager } from '@/lib/data';
import AlbumView from '@/components/AlbumView';
import AlbumProgress from '@/components/AlbumProgress';

interface Carta extends Partial<CartaJugadorManager>, Partial<CartaObjetoManager> {
  tipo: 'jugador' | 'objeto';
  Rareza: string;
  Nombre: string;
  NombreEquipo?: string;
  id: number;
  cantidad?: number;
  Puntos?: number;
}

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];

const normalizeString = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function AlbumPage() {
  const { manager, currency, setCurrency } = useAuth();
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroRareza, setFiltroRareza] = useState<string[]>([]);
  const [filtroEquipo, setFiltroEquipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('nombre');

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(32);
  const ITEMS_POR_PAGINA_OPTIONS = [8, 16, 32, 64, 128, 256, Infinity];


  useEffect(() => {
    const cargar = async () => {
      if (!manager) return;
      const resJug = await fetch(`/api/cartas-manager?managerId=${manager.idManager}`);
      const dataJug = await resJug.json();
      const resObj = await fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`);
      const dataObj = await resObj.json();

      const cartasJugador = dataJug.cartasJugador || [];
      const cartasObjeto = dataObj.cartasObjeto || [];

      const combinadas: Carta[] = [
        ...cartasJugador.map((c: CartaJugadorManager) => ({
          tipo: 'jugador',
          Rareza: c.Rareza,
          Nombre: c.NombreJugador,
          NombreEquipo: c.NombreEquipo,
          id: c.idCartaJugador,
          Puntos: c.Puntos,
        })),
        ...cartasObjeto.map((c: CartaObjetoManager) => ({
          tipo: 'objeto',
          Rareza: c.Rareza,
          Nombre: c.NombreObjeto,
          id: c.idCartaObjeto,
          Puntos: 0,
        })),
      ];
      setCartas(combinadas);
    };
    cargar();
  }, [manager]);

  const eliminarCarta = async (carta: Carta) => {
    if (!manager) return;
    setMensaje('');
    
    const cartaReal = cartas.find((c) => c.id === carta.id);
    if (!cartaReal) return;
    
    const res = await fetch(
      `/api/cartas/${cartaReal.tipo}/${cartaReal.id}?managerId=${manager.idManager}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (!res.ok) {
      setMensaje(data.error || 'Error');
      return;
    }
    
    setCartas((prev) => prev.filter(c => c.id !== cartaReal.id));
    
    const bal = data.balonesGanados || 0;
    setCurrency({ ...currency, balones: currency.balones + bal });
  };

  const cartasFiltradasYOrdenadas = useMemo(() => {
    const filtradas = cartas.filter((c) => {
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
      if (filtroRareza.length > 0 && !filtroRareza.some(r => normalizeString(r) === normalizeString(c.Rareza))) return false;
      if (filtroEquipo !== 'todos' && c.NombreEquipo !== filtroEquipo) return false;

      if (busqueda) {
          const busquedaLowerCase = busqueda.toLowerCase();
          const nombreJugador = c.Nombre?.toLowerCase() || '';
          const nombreEquipo = c.NombreEquipo?.toLowerCase() || '';
          if (!nombreJugador.includes(busquedaLowerCase) && !nombreEquipo.includes(busquedaLowerCase)) {
              return false;
          }
      }
      return true;
    });

    const ordenadas = filtradas.sort((a, b) => {
      if (ordenarPor === 'nombre') {
        return a.Nombre.localeCompare(b.Nombre);
      }
      if (ordenarPor === 'puntos') {
        const puntosA = a.Puntos || 0;
        const puntosB = b.Puntos || 0;
        return puntosB - puntosA;
      }
      if (ordenarPor === 'equipo') {
        const equipoA = a.NombreEquipo || '';
        const equipoB = b.NombreEquipo || '';
        return equipoA.localeCompare(equipoB);
      }
      if (ordenarPor === 'rareza') {
        const ordenRarezas = RAREZAS.reduce((acc, rareza, idx) => ({ ...acc, [rareza]: idx }), {} as Record<string, number>);
        return (ordenRarezas[a.Rareza] ?? 99) - (ordenRarezas[b.Rareza] ?? 99);
      }
      return 0;
    });

    return ordenadas;
  }, [cartas, filtroTipo, filtroRareza, filtroEquipo, busqueda, ordenarPor]);

  const handleRarezaChange = (rareza: string) => {
    setFiltroRareza(prev => 
      prev.includes(rareza) 
        ? prev.filter(r => r !== rareza) 
        : [...prev, rareza]
    );
    setPaginaActual(1);
  };
  
  const equiposUnicos = useMemo(() => {
    const equipos = cartas
      .filter(c => c.tipo === 'jugador' && c.NombreEquipo)
      .map(c => c.NombreEquipo as string);
    return ['todos', ...Array.from(new Set(equipos))].sort();
  }, [cartas]);
  
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = itemsPorPagina === Infinity ? 0 : indiceUltimoItem - itemsPorPagina;
  const cartasPaginadas = itemsPorPagina === Infinity
    ? cartasFiltradasYOrdenadas
    : cartasFiltradasYOrdenadas.slice(indicePrimerItem, indiceUltimoItem);

  const totalPaginas = itemsPorPagina === Infinity
    ? 1
    : Math.ceil(cartasFiltradasYOrdenadas.length / itemsPorPagina);

  return (
    <RequireAuth>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Álbum de cartas</h1>
        <AlbumProgress cartas={cartas} />
        <AlbumView
          cartas={cartasPaginadas}
          eliminarCarta={eliminarCarta}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroRareza={filtroRareza}
          setFiltroRareza={handleRarezaChange}
          filtroEquipo={filtroEquipo}
          setFiltroEquipo={setFiltroEquipo}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mensaje={mensaje}
          ordenarPor={ordenarPor}
          setOrdenarPor={setOrdenarPor}
          equiposUnicos={equiposUnicos}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          itemsPorPagina={itemsPorPagina}
          setPaginaActual={setPaginaActual}
          setItemsPorPagina={setItemsPorPagina}
          itemsPorPaginaOptions={ITEMS_POR_PAGINA_OPTIONS}
        />
      </div>
    </RequireAuth>
  );
}