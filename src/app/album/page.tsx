'use client';

import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useMemo } from 'react';
import { CartaJugadorManager, CartaObjetoManager, getPosicionFrontend } from '@/lib/data';
import AlbumView from '@/components/AlbumView';
import AlbumProgress from '@/components/AlbumProgress';

export interface Carta {
  tipo: 'jugador' | 'objeto';
  Rareza: string;
  Nombre: string;
  NombreEquipo?: string;
  id: number;
  cantidad?: number;
  Puntos?: number;
  // Player-specific
  jugadorId?: number;
  posicion?: string;
  posicionFrontend?: string;
  edad?: string;
  pais?: string;
  precio?: number;
  unidades?: number;
  // Object-specific
  Efecto?: string;
  ValorEfecto?: number;
  Descripcion?: string;
  Estadistica?: string;
  idObjetos?: number;
}

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];

const normalizeString = (str: string) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const RAREZA_MAP: Record<string, string> = {
  'comun': 'Común', 'común': 'Común',
  'raro': 'Raro', 'rara': 'Raro',
  'epico': 'Épico', 'epica': 'Épico', 'épico': 'Épico', 'épica': 'Épico',
  'legendario': 'Legendario', 'legendaria': 'Legendario',
};

const normalizeRareza = (r: string): string => {
  if (!r) return 'Común';
  return RAREZA_MAP[normalizeString(r)] ?? r;
};

// ── Tienda helpers ──────────────────────────────────────────────────────────
const RAREZA_DISPLAY: Record<string, string> = {
  Comun: 'Común', Común: 'Común',
  Rara: 'Raro', Raro: 'Raro',
  Epica: 'Épico', Épico: 'Épico',
  Legendaria: 'Legendario', Legendario: 'Legendario',
};
const RAREZA_BADGE: Record<string, string> = {
  'Común': 'bg-slate-100 text-slate-700 border-slate-400',
  'Raro': 'bg-blue-100 text-blue-700 border-blue-400',
  'Épico': 'bg-purple-100 text-purple-700 border-purple-400',
  'Legendario': 'bg-yellow-100 text-yellow-700 border-yellow-400',
};

interface TiendaItem {
  tipo: 'jugador' | 'objeto';
  id: number;
  Nombre: string;
  Rareza: string;       // display name (Común, Raro, Épico, Legendario)
  rarezaDB?: string;    // DB value (Comun, Rara, Epica, Legendaria) — for POST
  NombreEquipo?: string;
  Posicion?: string;
  Efecto?: string;
  ValorEfecto?: number;
  Estadistica?: string;
  Descripcion?: string;
  precioBalones: number;
  precioOro: number;
}

export default function AlbumPage() {
  const { manager, currency, setCurrency } = useAuth();
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [activeTab, setActiveTab] = useState<'album' | 'tienda'>('album');

  // ── Tienda state ──
  const [tiendaItems, setTiendaItems] = useState<TiendaItem[]>([]);
  const [tiendaLoaded, setTiendaLoaded] = useState(false);
  const [tiendaBusqueda, setTiendaBusqueda] = useState('');
  const [tiendaTipo, setTiendaTipo] = useState<'todos' | 'jugador' | 'objeto'>('todos');
  const [tiendaRareza, setTiendaRareza] = useState<string[]>([]);
  const [tiendaComprandoKey, setTiendaComprandoKey] = useState<string | null>(null);
  const [tiendaToast, setTiendaToast] = useState<string | null>(null);

  const [filtroTipoAlbum, setFiltroTipoAlbum] = useState('todos');
  const [filtroRareza, setFiltroRareza] = useState<string[]>([]);
  const [filtroEquipo, setFiltroEquipo] = useState('todos');
  const [filtroPosicion, setFiltroPosicion] = useState('todos');
  const [filtroEstadistica, setFiltroEstadistica] = useState('todos');
  const [filtroEfecto, setFiltroEfecto] = useState('todos');
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

      const cartasJugador: CartaJugadorManager[] = dataJug.cartasJugador || [];
      const cartasObjeto: CartaObjetoManager[] = dataObj.cartasObjeto || [];

      // Count units per jugador
      const countsByJugador: Record<number, number> = {};
      cartasJugador.forEach((c) => {
        countsByJugador[c.Jugador_idJugadorDB] = (countsByJugador[c.Jugador_idJugadorDB] || 0) + 1;
      });

      const combinadas: Carta[] = [
        ...cartasJugador.map((c: CartaJugadorManager) => {
          let posicionFrontend = 'DEL';
          try { posicionFrontend = getPosicionFrontend(c.PosicionJugadorDB); } catch {}
          return {
            tipo: 'jugador' as const,
            Rareza: normalizeRareza(c.Rareza),
            Nombre: c.NombreJugador,
            NombreEquipo: c.NombreEquipo,
            id: c.idCartaJugador,
            Puntos: c.Puntos ?? 0,
            jugadorId: c.Jugador_idJugadorDB,
            posicion: c.PosicionJugadorDB,
            posicionFrontend,
            edad: c.Edad?.split('-')[0] ?? '',
            pais: c.Pais,
            precio: c.Precio,
            unidades: countsByJugador[c.Jugador_idJugadorDB] ?? 1,
          };
        }),
        ...cartasObjeto.map((c: CartaObjetoManager) => ({
          tipo: 'objeto' as const,
          Rareza: normalizeRareza(c.Rareza),
          Nombre: c.NombreObjeto,
          id: c.idCartaObjeto,
          Puntos: 0,
          idObjetos: c.Objeto_idObjetoDB,
          Efecto: c.EfectoObjeto,
          ValorEfecto: c.ValorEfecto,
          Descripcion: c.DescripcionObjeto,
          Estadistica: c.EstadisticaObjeto,
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

  const [toastVenta, setToastVenta] = useState<string | null>(null);

  const venderMultiple = async (cartasAVender: Carta[]) => {
    if (!manager) return;
    let totalBalones = 0;
    const idsEliminados: number[] = [];

    for (const carta of cartasAVender) {
      const res = await fetch(
        `/api/cartas/${carta.tipo}/${carta.id}?managerId=${manager.idManager}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        const data = await res.json();
        totalBalones += data.balonesGanados || 0;
        idsEliminados.push(carta.id);
      }
    }

    if (idsEliminados.length > 0) {
      setCartas((prev) => prev.filter(c => !idsEliminados.includes(c.id)));
      setCurrency({ ...currency, balones: currency.balones + totalBalones });
      setToastVenta(`¡${idsEliminados.length} carta${idsEliminados.length !== 1 ? 's' : ''} vendida${idsEliminados.length !== 1 ? 's' : ''}! +${totalBalones} 🏐`);
      setTimeout(() => setToastVenta(null), 4000);
    }
  };

  const RAREZA_ORDER: Record<string, number> = { 'Común': 0, 'Raro': 1, 'Épico': 2, 'Legendario': 3 };

  // Duplicate sellable: non-common player duplicates + all object duplicates (keep best, sell rest)
  const duplicadosVendibles = useMemo(() => {
    const toSell: Carta[] = [];
    // Players
    const playerGroups: Record<number, Carta[]> = {};
    cartas.filter(c => c.tipo === 'jugador' && c.jugadorId !== undefined).forEach(c => {
      playerGroups[c.jugadorId!] = [...(playerGroups[c.jugadorId!] || []), c];
    });
    Object.values(playerGroups).forEach(group => {
      if (group.length <= 1) return;
      const sorted = [...group].sort((a, b) => {
        const rDiff = (RAREZA_ORDER[b.Rareza] ?? 0) - (RAREZA_ORDER[a.Rareza] ?? 0);
        return rDiff !== 0 ? rDiff : (b.Puntos ?? 0) - (a.Puntos ?? 0);
      });
      toSell.push(...sorted.slice(1).filter(c => c.Rareza !== 'Común'));
    });
    // Objects
    const objectGroups: Record<number, Carta[]> = {};
    cartas.filter(c => c.tipo === 'objeto' && c.idObjetos !== undefined).forEach(c => {
      objectGroups[c.idObjetos!] = [...(objectGroups[c.idObjetos!] || []), c];
    });
    Object.values(objectGroups).forEach(group => {
      if (group.length <= 1) return;
      toSell.push(...group.slice(1));
    });
    return toSell;
  }, [cartas]);

  // Duplicate commons: common player cards with >1 copy of same player
  const duplicadosComunes = useMemo(() => {
    const toDelete: Carta[] = [];
    const playerGroups: Record<number, Carta[]> = {};
    cartas.filter(c => c.tipo === 'jugador' && c.Rareza === 'Común' && c.jugadorId !== undefined).forEach(c => {
      playerGroups[c.jugadorId!] = [...(playerGroups[c.jugadorId!] || []), c];
    });
    Object.values(playerGroups).forEach(group => {
      if (group.length <= 1) return;
      toDelete.push(...group.slice(1));
    });
    return toDelete;
  }, [cartas]);

  const [showConfirmDuplicados, setShowConfirmDuplicados] = useState<
    { tipo: 'vendibles' | 'comunes'; cartas: Carta[] } | null
  >(null);
  const [procesandoDuplicados, setProcesandoDuplicados] = useState(false);

  const handleConfirmarDuplicados = async () => {
    if (!showConfirmDuplicados) return;
    setProcesandoDuplicados(true);
    await venderMultiple(showConfirmDuplicados.cartas);
    setShowConfirmDuplicados(null);
    setProcesandoDuplicados(false);
  };

  // ── Tienda: cargar catálogo cuando se activa la pestaña ──
  useEffect(() => {
    if (activeTab !== 'tienda' || tiendaLoaded) return;
    const cargar = async () => {
      const res = await fetch('/api/tienda');
      if (!res.ok) return;
      const data = await res.json();
      const { jugadores = [], objetos = [], precios } = data;
      const RAREZAS_JUGADOR = ['Comun', 'Rara', 'Epica', 'Legendaria'] as const;
      const items: TiendaItem[] = [
        ...jugadores.flatMap((j: any) =>
          RAREZAS_JUGADOR.map((rarezaDB) => {
            const rarezaDisplay = RAREZA_DISPLAY[rarezaDB] ?? 'Común';
            const precio = precios.jugador[rarezaDB] ?? precios.jugador['Comun'];
            return {
              tipo: 'jugador' as const,
              id: j.idJugador,
              Nombre: j.Nombre,
              Rareza: rarezaDisplay,
              rarezaDB,
              NombreEquipo: j.NombreEquipo,
              Posicion: j.Posicion,
              precioBalones: precio.balones,
              precioOro: precio.oro,
            };
          })
        ),
        ...objetos.map((o: any) => {
          const rarezaDisplay = RAREZA_DISPLAY[o.Rareza] ?? 'Común';
          const precioKey = o.Rareza as string;
          const precioObj = precios.objeto[precioKey] ?? precios.objeto['Comun'];
          return {
            tipo: 'objeto' as const,
            id: o.idObjetos,
            Nombre: o.Nombre,
            Rareza: rarezaDisplay,
            Efecto: o.Efecto,
            ValorEfecto: o.ValorEfecto,
            Estadistica: o.Estadistica,
            Descripcion: o.Descripcion,
            precioBalones: precioObj.balones,
            precioOro: precioObj.oro,
          };
        }),
      ];
      setTiendaItems(items);
      setTiendaLoaded(true);
    };
    cargar();
  }, [activeTab, tiendaLoaded]);

  const handleComprar = async (item: TiendaItem, moneda: 'balones' | 'oro') => {
    if (!manager) return;
    const comprandoKey = `${item.tipo}-${item.id}-${item.rarezaDB ?? item.Rareza}`;
    setTiendaComprandoKey(comprandoKey);
    try {
      const res = await fetch('/api/tienda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: manager.idManager, tipo: item.tipo, idItem: item.id, moneda, rareza: item.rarezaDB }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTiendaToast(`❌ ${data.error || 'Error al comprar'}`);
      } else {
        setCurrency({ ...currency, oro: data.oro, balones: data.balones });
        setTiendaToast(`✅ ¡${item.Nombre} añadido a tu colección!`);
        // Refresh owned cards
        const resJug = await fetch(`/api/cartas-manager?managerId=${manager.idManager}`);
        const dataJug = await resJug.json();
        const resObj = await fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`);
        const dataObj = await resObj.json();
        const cartasJugador: CartaJugadorManager[] = dataJug.cartasJugador || [];
        const cartasObjeto: CartaObjetoManager[] = dataObj.cartasObjeto || [];
        const countsByJugador: Record<number, number> = {};
        cartasJugador.forEach((c) => { countsByJugador[c.Jugador_idJugadorDB] = (countsByJugador[c.Jugador_idJugadorDB] || 0) + 1; });
        setCartas([
          ...cartasJugador.map((c) => {
            let posicionFrontend = 'DEL';
            try { posicionFrontend = getPosicionFrontend(c.PosicionJugadorDB); } catch {}
            return { tipo: 'jugador' as const, Rareza: normalizeRareza(c.Rareza), Nombre: c.NombreJugador, NombreEquipo: c.NombreEquipo, id: c.idCartaJugador, Puntos: c.Puntos ?? 0, jugadorId: c.Jugador_idJugadorDB, posicion: c.PosicionJugadorDB, posicionFrontend, edad: c.Edad?.split('-')[0] ?? '', pais: c.Pais, precio: c.Precio, unidades: countsByJugador[c.Jugador_idJugadorDB] ?? 1 };
          }),
          ...cartasObjeto.map((c) => ({ tipo: 'objeto' as const, Rareza: normalizeRareza(c.Rareza), Nombre: c.NombreObjeto, id: c.idCartaObjeto, Puntos: 0, idObjetos: c.Objeto_idObjetoDB, Efecto: c.EfectoObjeto, ValorEfecto: c.ValorEfecto, Descripcion: c.DescripcionObjeto, Estadistica: c.EstadisticaObjeto })),
        ]);
      }
    } finally {
      setTiendaComprandoKey(null);
      setTimeout(() => setTiendaToast(null), 4000);
    }
  };

  const tiendaItemsFiltrados = useMemo(() => {
    return tiendaItems.filter((item) => {
      if (tiendaTipo !== 'todos' && item.tipo !== tiendaTipo) return false;
      if (tiendaRareza.length > 0 && !tiendaRareza.some(r => normalizeString(r) === normalizeString(item.Rareza))) return false;
      if (tiendaBusqueda) {
        const q = tiendaBusqueda.toLowerCase();
        const match = item.Nombre.toLowerCase().includes(q)
          || (item.NombreEquipo?.toLowerCase().includes(q) ?? false)
          || (item.Estadistica?.toLowerCase().includes(q) ?? false)
          || (item.Descripcion?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [tiendaItems, tiendaTipo, tiendaRareza, tiendaBusqueda]);

  const cartasFiltradasYOrdenadas = useMemo(() => {
    const filtradas = cartas.filter((c) => {
      if (filtroTipoAlbum !== 'todos' && c.tipo !== filtroTipoAlbum) return false;
      if (filtroRareza.length > 0 && !filtroRareza.some(r => normalizeString(r) === normalizeString(c.Rareza))) return false;
      if (filtroEquipo !== 'todos' && c.NombreEquipo !== filtroEquipo) return false;
      if (filtroPosicion !== 'todos' && c.tipo === 'jugador' && c.posicionFrontend !== filtroPosicion) return false;
      if (filtroEstadistica !== 'todos' && c.tipo === 'objeto' && c.Estadistica !== filtroEstadistica) return false;
      if (filtroEfecto !== 'todos' && c.tipo === 'objeto' && c.Efecto !== filtroEfecto) return false;

      if (busqueda) {
        const q = busqueda.toLowerCase();
        const matchNombre = c.Nombre?.toLowerCase().includes(q) ?? false;
        const matchEquipo = c.NombreEquipo?.toLowerCase().includes(q) ?? false;
        const matchEstadistica = c.Estadistica?.toLowerCase().includes(q) ?? false;
        const matchDescripcion = c.Descripcion?.toLowerCase().includes(q) ?? false;
        if (!matchNombre && !matchEquipo && !matchEstadistica && !matchDescripcion) {
          return false;
        }
      }
      return true;
    });

    const ordenadas = filtradas.sort((a, b) => {
      if (ordenarPor === 'nombre') return a.Nombre.localeCompare(b.Nombre);
      if (ordenarPor === 'puntos') return (b.Puntos || 0) - (a.Puntos || 0);
      if (ordenarPor === 'equipo') return (a.NombreEquipo || '').localeCompare(b.NombreEquipo || '');
      if (ordenarPor === 'rareza') {
        const ordenRarezas = RAREZAS.reduce((acc, rareza, idx) => ({ ...acc, [rareza]: idx }), {} as Record<string, number>);
        return (ordenRarezas[a.Rareza] ?? 99) - (ordenRarezas[b.Rareza] ?? 99);
      }
      return 0;
    });

    return ordenadas;
  }, [cartas, filtroTipoAlbum, filtroRareza, filtroEquipo, filtroPosicion, filtroEstadistica, filtroEfecto, busqueda, ordenarPor]);

  const handleRarezaChange = (rareza: string) => {
    setFiltroRareza(prev =>
      prev.includes(rareza)
        ? prev.filter(r => r !== rareza)
        : [...prev, rareza]
    );
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltroTipoAlbum('todos');
    setFiltroRareza([]);
    setFiltroEquipo('todos');
    setFiltroPosicion('todos');
    setFiltroEstadistica('todos');
    setFiltroEfecto('todos');
    setBusqueda('');
    setOrdenarPor('nombre');
    setPaginaActual(1);
  };

  const equiposUnicos = useMemo(() => {
    const equipos = cartas
      .filter(c => c.tipo === 'jugador' && c.NombreEquipo)
      .map(c => c.NombreEquipo as string);
    return ['todos', ...Array.from(new Set(equipos))].sort();
  }, [cartas]);

  const estadisticasUnicas = useMemo(() => {
    const stats = cartas
      .filter(c => c.tipo === 'objeto' && c.Estadistica)
      .map(c => c.Estadistica as string);
    return ['todos', ...Array.from(new Set(stats)).sort()];
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
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Álbum de cartas</h1>
        <AlbumProgress cartas={cartas} />

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('album')}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'album'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Mi Álbum
          </button>
          <button
            onClick={() => setActiveTab('tienda')}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'tienda'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            🛒 Tienda
          </button>
        </div>

        {/* ── Tienda ── */}
        {activeTab === 'tienda' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <input
                type="text"
                placeholder="Buscar jugador, objeto, equipo..."
                value={tiendaBusqueda}
                onChange={(e) => setTiendaBusqueda(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-1.5 text-sm text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
              />
              <select
                value={tiendaTipo}
                onChange={(e) => setTiendaTipo(e.target.value as any)}
                className="bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="jugador">Jugadores</option>
                <option value="objeto">Objetos</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2 items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rareza</span>
              {RAREZAS.map((r) => {
                const activo = tiendaRareza.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => setTiendaRareza(prev => activo ? prev.filter(x => x !== r) : [...prev, r])}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                      activo ? RAREZA_BADGE[r] + ' opacity-100 scale-105' : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600 opacity-60'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
              {(tiendaBusqueda || tiendaTipo !== 'todos' || tiendaRareza.length > 0) && (
                <button onClick={() => { setTiendaBusqueda(''); setTiendaTipo('todos'); setTiendaRareza([]); }} className="text-xs text-red-500 underline ml-1">
                  Limpiar
                </button>
              )}
              <span className="ml-auto text-xs text-gray-400">{tiendaItemsFiltrados.length} artículos</span>
            </div>

            {!tiendaLoaded ? (
              <p className="text-center text-gray-500 py-12">Cargando tienda...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tiendaItemsFiltrados.map((item) => {
                  const rarezaBadge = RAREZA_BADGE[item.Rareza] ?? 'bg-gray-100 text-gray-700 border-gray-300';
                  const itemKey = `${item.tipo}-${item.id}-${item.rarezaDB ?? item.Rareza}`;
                  const comprando = tiendaComprandoKey === itemKey;
                  const sinBalones = currency.balones < item.precioBalones;
                  const sinOro = currency.oro < item.precioOro;
                  return (
                    <div key={itemKey} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rarezaBadge}`}>{item.Rareza}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tipo === 'jugador' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.tipo === 'jugador' ? (item.Posicion ?? 'JUG') : 'OBJ'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate">{item.Nombre}</p>
                        {item.NombreEquipo && <p className="text-xs text-gray-400 truncate">{item.NombreEquipo}</p>}
                        {item.Estadistica && <p className="text-xs text-gray-400 truncate">{item.Estadistica}</p>}
                        {item.Descripcion && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.Descripcion}</p>}
                      </div>
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span className="font-semibold text-amber-600">{item.precioBalones.toLocaleString()} 🏐</span>
                          <span className="font-semibold text-yellow-600">{item.precioOro.toLocaleString()} 🥇</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleComprar(item, 'balones')}
                            disabled={comprando || sinBalones}
                            className="flex-1 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {comprando ? '...' : sinBalones ? 'Sin 🏐' : 'Comprar 🏐'}
                          </button>
                          <button
                            onClick={() => handleComprar(item, 'oro')}
                            disabled={comprando || sinOro}
                            className="flex-1 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {comprando ? '...' : sinOro ? 'Sin 🥇' : 'Comprar 🥇'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Álbum ── */}
        {activeTab === 'album' && <AlbumView
          cartas={cartasPaginadas}
          eliminarCarta={eliminarCarta}
          venderMultiple={venderMultiple}
          filtroTipo={filtroTipoAlbum}
          setFiltroTipo={setFiltroTipoAlbum}
          filtroRareza={filtroRareza}
          setFiltroRareza={handleRarezaChange}
          filtroEquipo={filtroEquipo}
          setFiltroEquipo={setFiltroEquipo}
          filtroPosicion={filtroPosicion}
          setFiltroPosicion={setFiltroPosicion}
          filtroEstadistica={filtroEstadistica}
          setFiltroEstadistica={setFiltroEstadistica}
          filtroEfecto={filtroEfecto}
          setFiltroEfecto={setFiltroEfecto}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mensaje={mensaje}
          ordenarPor={ordenarPor}
          setOrdenarPor={setOrdenarPor}
          equiposUnicos={equiposUnicos}
          estadisticasUnicas={estadisticasUnicas}
          limpiarFiltros={limpiarFiltros}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          itemsPorPagina={itemsPorPagina}
          setPaginaActual={setPaginaActual}
          setItemsPorPagina={setItemsPorPagina}
          itemsPorPaginaOptions={ITEMS_POR_PAGINA_OPTIONS}
          onEliminarDuplicados={duplicadosVendibles.length > 0
            ? () => setShowConfirmDuplicados({ tipo: 'vendibles', cartas: duplicadosVendibles })
            : undefined}
          onEliminarComunesRepetidos={duplicadosComunes.length > 0
            ? () => setShowConfirmDuplicados({ tipo: 'comunes', cartas: duplicadosComunes })
            : undefined}
          countDuplicadosVendibles={duplicadosVendibles.length}
          countDuplicadosComunes={duplicadosComunes.length}
        />}
      </div>

      {/* Modal confirmación eliminar duplicados */}
      {showConfirmDuplicados && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {showConfirmDuplicados.tipo === 'vendibles' ? 'Vender duplicados' : 'Eliminar comunes repetidos'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {showConfirmDuplicados.tipo === 'vendibles'
                ? `Se venderán ${showConfirmDuplicados.cartas.length} cartas duplicadas (no comunes). Se conserva la de mayor rareza/puntos.`
                : `Se eliminarán ${showConfirmDuplicados.cartas.length} cartas comunes repetidas. Se conserva 1 copia de cada jugador.`
              }
            </p>
            <ul className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 mb-4 text-sm">
              {showConfirmDuplicados.cartas.map((c, i) => (
                <li key={i} className="py-1.5 flex justify-between items-center">
                  <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{c.Nombre}</span>
                  <span className="text-gray-500 text-xs shrink-0 ml-2">{c.Rareza}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDuplicados(null)}
                disabled={procesandoDuplicados}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDuplicados}
                disabled={procesandoDuplicados}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {procesandoDuplicados ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de venta múltiple */}
      {toastVenta && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce">
          {toastVenta}
        </div>
      )}

      {/* Toast de tienda */}
      {tiendaToast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce ${tiendaToast.startsWith('✅') ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {tiendaToast}
        </div>
      )}
    </RequireAuth>
  );
}
