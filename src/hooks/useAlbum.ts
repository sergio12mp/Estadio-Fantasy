'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { CartaJugadorManager, CartaObjetoManager, getPosicionFrontend } from '@/lib/data';
import { Carta, TiendaItem } from '@/lib/album-types';

// ── Helpers internos ──────────────────────────────────────────────────────────

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

const RAREZA_DISPLAY: Record<string, string> = {
    Comun: 'Común', Común: 'Común',
    Rara: 'Raro', Raro: 'Raro',
    Epica: 'Épico', Épico: 'Épico',
    Legendaria: 'Legendario', Legendario: 'Legendario',
};

const RAREZA_ORDER: Record<string, number> = { 'Común': 0, 'Raro': 1, 'Épico': 2, 'Legendario': 3 };

const RAREZAS_JUGADOR_DB = ['Comun', 'Rara', 'Epica', 'Legendaria'] as const;

function mapearCartas(cartasJugador: CartaJugadorManager[], cartasObjeto: CartaObjetoManager[]): Carta[] {
    const countsByJugador: Record<number, number> = {};
    cartasJugador.forEach((c) => { countsByJugador[c.Jugador_idJugadorDB] = (countsByJugador[c.Jugador_idJugadorDB] || 0) + 1; });
    return [
        ...cartasJugador.map((c: CartaJugadorManager) => {
            let posicionFrontend = 'DEL';
            if (c.PosicionOverride) {
                posicionFrontend = c.PosicionOverride;
            } else {
                try { posicionFrontend = getPosicionFrontend(c.PosicionJugadorDB); } catch {}
            }
            return {
                tipo: 'jugador' as const,
                Rareza: normalizeRareza(c.Rareza),
                Nombre: c.NombreJugador,
                NombreEquipo: c.NombreEquipo,
                id: c.idCartaJugador,
                Puntos: c.Puntos ?? null,
                jugadorId: c.Jugador_idJugadorDB,
                slug: c.slug ?? null,
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
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAlbum() {
    const { manager, currency, setCurrency } = useAuth();

    const [cartas, setCartas] = useState<Carta[]>([]);
    const [activeTab, setActiveTab] = useState<'album' | 'tienda'>('album');

    // Tienda state
    const [tiendaItems, setTiendaItems] = useState<TiendaItem[]>([]);
    const [tiendaLoaded, setTiendaLoaded] = useState(false);
    const [tiendaBusqueda, setTiendaBusqueda] = useState('');
    const [tiendaTipo, setTiendaTipo] = useState<'todos' | 'jugador' | 'objeto'>('todos');
    const [tiendaRareza, setTiendaRareza] = useState<string[]>([]);
    const [tiendaComprandoKey, setTiendaComprandoKey] = useState<string | null>(null);
    const [tiendaToast, setTiendaToast] = useState<string | null>(null);

    // Album filters
    const [filtroTipoAlbum, setFiltroTipoAlbum] = useState('todos');
    const [filtroRareza, setFiltroRareza] = useState<string[]>([]);
    const [filtroEquipo, setFiltroEquipo] = useState('todos');
    const [filtroPosicion, setFiltroPosicion] = useState('todos');
    const [filtroEstadistica, setFiltroEstadistica] = useState('todos');
    const [filtroEfecto, setFiltroEfecto] = useState('todos');
    const [filtroJornada, setFiltroJornada] = useState<number | null>(null);
    const [filtroMinPuntos, setFiltroMinPuntos] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('nombre');

    const [jornadas, setJornadas] = useState<{ idJornada: number; Nombre: string }[]>([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina, setItemsPorPagina] = useState(32);

    // Duplicados
    const [showConfirmDuplicados, setShowConfirmDuplicados] = useState<
        { tipo: 'vendibles' | 'comunes'; cartas: Carta[] } | null
    >(null);
    const [procesandoDuplicados, setProcesandoDuplicados] = useState(false);
    const [toastVenta, setToastVenta] = useState<string | null>(null);

    // Cargar jornadas disponibles
    useEffect(() => {
        fetch('/api/jornada').then(r => r.json()).then(data => {
            if (data.result) setJornadas(data.result);
        }).catch(console.error);
    }, []);

    // Cargar cartas del manager (o filtradas por jornada)
    useEffect(() => {
        const cargar = async () => {
            if (!manager) return;
            const jornadaParam = filtroJornada ? `&idJornada=${filtroJornada}` : '';
            const [resJug, resObj] = await Promise.all([
                fetch(`/api/cartas-manager?managerId=${manager.idManager}${jornadaParam}`),
                fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`),
            ]);
            const dataJug = await resJug.json();
            const dataObj = await resObj.json();
            setCartas(mapearCartas(dataJug.cartasJugador || [], dataObj.cartasObjeto || []));
        };
        cargar();
    }, [manager, filtroJornada]);

    // Cargar catálogo de tienda al activar la pestaña
    useEffect(() => {
        if (activeTab !== 'tienda' || tiendaLoaded) return;
        const cargar = async () => {
            const res = await fetch('/api/tienda');
            if (!res.ok) return;
            const data = await res.json();
            const { jugadores = [], objetos = [], precios } = data;
            const items: TiendaItem[] = [
                ...jugadores.flatMap((j: any) =>
                    RAREZAS_JUGADOR_DB.map((rarezaDB) => {
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
                    const precioObj = precios.objeto[o.Rareza] ?? precios.objeto['Comun'];
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
        if (!res.ok) { setMensaje(data.error || 'Error'); return; }
        setCartas((prev) => prev.filter(c => c.id !== cartaReal.id));
        const bal = data.balonesGanados || 0;
        setCurrency({ ...currency, balones: currency.balones + bal });
    };

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

    const handleConfirmarDuplicados = async () => {
        if (!showConfirmDuplicados) return;
        setProcesandoDuplicados(true);
        await venderMultiple(showConfirmDuplicados.cartas);
        setShowConfirmDuplicados(null);
        setProcesandoDuplicados(false);
    };

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
                const jornadaParam = filtroJornada ? `&idJornada=${filtroJornada}` : '';
                const [resJug2, resObj2] = await Promise.all([
                    fetch(`/api/cartas-manager?managerId=${manager.idManager}${jornadaParam}`),
                    fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`),
                ]);
                const dataJug2 = await resJug2.json();
                const dataObj2 = await resObj2.json();
                setCartas(mapearCartas(dataJug2.cartasJugador || [], dataObj2.cartasObjeto || []));
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
        const minPts = filtroMinPuntos !== '' ? parseFloat(filtroMinPuntos) : null;
        const filtradas = cartas.filter((c) => {
            if (filtroTipoAlbum !== 'todos' && c.tipo !== filtroTipoAlbum) return false;
            if (filtroRareza.length > 0 && !filtroRareza.some(r => normalizeString(r) === normalizeString(c.Rareza))) return false;
            if (filtroEquipo !== 'todos' && c.NombreEquipo !== filtroEquipo) return false;
            if (filtroPosicion !== 'todos' && c.tipo === 'jugador' && c.posicionFrontend !== filtroPosicion) return false;
            if (filtroEstadistica !== 'todos' && c.tipo === 'objeto' && c.Estadistica !== filtroEstadistica) return false;
            if (filtroEfecto !== 'todos' && c.tipo === 'objeto' && c.Efecto !== filtroEfecto) return false;
            if (minPts !== null && c.tipo === 'jugador' && (c.Puntos ?? 0) < minPts) return false;
            if (busqueda) {
                const q = busqueda.toLowerCase();
                if (
                    !(c.Nombre?.toLowerCase().includes(q) ?? false) &&
                    !(c.NombreEquipo?.toLowerCase().includes(q) ?? false) &&
                    !(c.Estadistica?.toLowerCase().includes(q) ?? false) &&
                    !(c.Descripcion?.toLowerCase().includes(q) ?? false)
                ) return false;
            }
            return true;
        });
        return filtradas.sort((a, b) => {
            if (ordenarPor === 'nombre') return a.Nombre.localeCompare(b.Nombre);
            if (ordenarPor === 'puntos') return (b.Puntos || 0) - (a.Puntos || 0);
            if (ordenarPor === 'equipo') return (a.NombreEquipo || '').localeCompare(b.NombreEquipo || '');
            if (ordenarPor === 'rareza') return (RAREZA_ORDER[a.Rareza] ?? 99) - (RAREZA_ORDER[b.Rareza] ?? 99);
            return 0;
        });
    }, [cartas, filtroTipoAlbum, filtroRareza, filtroEquipo, filtroPosicion, filtroEstadistica, filtroEfecto, filtroMinPuntos, busqueda, ordenarPor]);

    const handleRarezaChange = (rareza: string) => {
        setFiltroRareza(prev =>
            prev.includes(rareza) ? prev.filter(r => r !== rareza) : [...prev, rareza]
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
        setFiltroJornada(null);
        setFiltroMinPuntos('');
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

    const duplicadosVendibles = useMemo(() => {
        const toSell: Carta[] = [];
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

    const indiceUltimoItem = paginaActual * itemsPorPagina;
    const indicePrimerItem = itemsPorPagina === Infinity ? 0 : indiceUltimoItem - itemsPorPagina;
    const cartasPaginadas = itemsPorPagina === Infinity
        ? cartasFiltradasYOrdenadas
        : cartasFiltradasYOrdenadas.slice(indicePrimerItem, indiceUltimoItem);
    const totalPaginas = itemsPorPagina === Infinity
        ? 1
        : Math.ceil(cartasFiltradasYOrdenadas.length / itemsPorPagina);

    return {
        cartas,
        currency,
        activeTab,
        setActiveTab,
        // Tienda
        tiendaItems,
        tiendaLoaded,
        tiendaBusqueda,
        setTiendaBusqueda,
        tiendaTipo,
        setTiendaTipo,
        tiendaRareza,
        setTiendaRareza,
        tiendaComprandoKey,
        tiendaToast,
        tiendaItemsFiltrados,
        handleComprar,
        // Album filters
        filtroTipoAlbum,
        setFiltroTipoAlbum,
        filtroRareza,
        filtroEquipo,
        setFiltroEquipo,
        filtroPosicion,
        setFiltroPosicion,
        filtroEstadistica,
        setFiltroEstadistica,
        filtroEfecto,
        setFiltroEfecto,
        filtroJornada,
        setFiltroJornada: (id: number | null) => { setFiltroJornada(id); setPaginaActual(1); },
        filtroMinPuntos,
        setFiltroMinPuntos: (v: string) => { setFiltroMinPuntos(v); setPaginaActual(1); },
        busqueda,
        setBusqueda,
        mensaje,
        ordenarPor,
        setOrdenarPor,
        jornadas,
        paginaActual,
        setPaginaActual,
        itemsPorPagina,
        setItemsPorPagina,
        // Computed
        cartasPaginadas,
        totalPaginas,
        equiposUnicos,
        estadisticasUnicas,
        // Duplicados
        duplicadosVendibles,
        duplicadosComunes,
        showConfirmDuplicados,
        setShowConfirmDuplicados,
        procesandoDuplicados,
        toastVenta,
        // Handlers
        eliminarCarta,
        venderMultiple,
        handleConfirmarDuplicados,
        handleRarezaChange,
        limpiarFiltros,
    };
}
