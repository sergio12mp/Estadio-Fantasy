'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { CartaJugadorManager, CartaObjetoManager } from '@/lib/data';

// Tipos de datos
interface Carta extends Partial<CartaJugadorManager>, Partial<CartaObjetoManager> {
    tipo: 'jugador' | 'objeto';
    Rareza: string;
    Nombre: string;
    NombreEquipo?: string;
    id: number;
    cantidad?: number;
}

// Lógica de recompensa
function reward(rareza: string): number {
    switch (rareza) {
        case 'Común':
        case 'Comun':
            return 5;
        case 'Raro':
        case 'Rara':
            return 10;
        case 'Épico':
        case 'Epico':
            return 15;
        case 'Legendario':
        case 'Legendario':
            return 20;
        default:
            return 0;
    }
}

export default function AlbumClientComponent({ managerId }: { managerId: number }) {
    const { currency, setCurrency } = useAuth();
    const [cartas, setCartas] = useState<Carta[]>([]);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroRareza, setFiltroRareza] = useState('todas');
    const [busqueda, setBusqueda] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(true);

    // useEffect para obtener los datos de la API cuando el managerId esté disponible
    const cargarCartas = async () => {
        if (!managerId) return;
        setLoading(true);
        const resJug = await fetch(`/api/cartas-manager?managerId=${managerId}`);
        const dataJug = await resJug.json();
        const resObj = await fetch(`/api/cartas-manager/objetos?managerId=${managerId}`);
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
        setLoading(false);
    };

    useEffect(() => {
        cargarCartas();
    }, [managerId]); // El efecto se ejecuta cuando managerId cambia (es decir, cuando se carga por primera vez)

    // La función de eliminar ahora re-obtiene los datos para refrescar la UI
    const eliminarCarta = async (carta: Carta) => {
        if (!managerId) return;
        setMensaje('');

        // Optimistic update (Actualización optimista):
        const cartasAntes = cartas;
        const cartasFiltradasParaUI = cartas.filter(
            (c) => !(c.tipo === carta.tipo && c.Nombre === carta.Nombre && c.Rareza === carta.Rareza)
        );
        setCartas(cartasFiltradasParaUI);

        const cartaReal = cartasAntes.find(
            (c) => c.tipo === carta.tipo && c.Nombre === carta.Nombre && c.Rareza === carta.Rareza
        );
        if (!cartaReal) return;

        const res = await fetch(
            `/api/cartas/${cartaReal.tipo}/${cartaReal.id}?managerId=${managerId}`,
            { method: 'DELETE' }
        );

        const data = await res.json();
        if (!res.ok) {
            setMensaje(data.error || 'Error al eliminar');
            setCartas(cartasAntes); // Revertimos la UI si hay error
            return;
        }

        // Volvemos a cargar los datos para asegurar que están sincronizados
        await cargarCartas();

        const bal = data.balonesGanados || 0;
        setCurrency({ ...currency, balones: currency.balones + bal });
    };

    const cartasFiltradas = cartas.filter((c) => {
        if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
        if (filtroRareza !== 'todas' && c.Rareza !== filtroRareza) return false;
        if (busqueda && !c.Nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
        return true;
    });

    const agrupadas = new Map<string, Carta>();
    for (const c of cartasFiltradas) {
        const key = `${c.tipo}-${c.Nombre}-${c.Rareza}`;
        const existente = agrupadas.get(key);
        if (existente) {
            existente.cantidad = (existente.cantidad || 1) + 1;
        } else {
            agrupadas.set(key, { ...c, cantidad: 1 });
        }
    }
    const cartasMostrar = Array.from(agrupadas.values());

    if (loading) {
        return <p>Cargando álbum...</p>;
    }

    return (
        <>
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
                {cartasMostrar.map((c, idx) => (
                    <li key={idx} className="mb-1">
                        {c.tipo} - {c.Nombre} ({c.Rareza}) x{c.cantidad}{' '}
                        {c.NombreEquipo && `- ${c.NombreEquipo}`}
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
        </>
    );
}