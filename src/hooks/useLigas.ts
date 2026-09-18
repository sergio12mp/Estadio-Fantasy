'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export type Liga = {
    idLigas: number;
    Nombre: string;
    Codigo: string | null;
    tipo: 'general' | 'privada' | 'club';
    idEquipo: number | null;
    NombreEquipo: string | null;
};

export type Clasificacion = {
    idManager: number;
    nombreManager: string;
    puntuacion_actual: number;
    isBot: number;
};

type Toast = { message: string; type: 'success' | 'error' | 'info' };

export function useLigas() {
    const { manager } = useAuth();

    const [ligas, setLigas] = useState<Liga[]>([]);
    const [isLoadingLigas, setIsLoadingLigas] = useState(true);
    const [errorLigas, setErrorLigas] = useState<string | null>(null);

    const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
    const [clasificacion, setClasificacion] = useState<Clasificacion[]>([]);
    const [ligaInfo, setLigaInfo] = useState<{ tipo: string; NombreEquipo: string | null } | null>(null);
    const [isLoadingClasificacion, setIsLoadingClasificacion] = useState(false);
    const [errorClasificacion, setErrorClasificacion] = useState<string | null>(null);

    const [showCreateLigaModal, setShowCreateLigaModal] = useState(false);
    const [isLoadingCreate, setIsLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState<string | null>(null);

    const [showJoinLigaModal, setShowJoinLigaModal] = useState(false);
    const [isLoadingJoin, setIsLoadingJoin] = useState(false);
    const [errorJoin, setErrorJoin] = useState<string | null>(null);

    const [showCodigo, setShowCodigo] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const selectedLiga = ligas.find(l => l.idLigas === selectedLigaId);

    const fetchLigas = async () => {
        if (!manager?.idManager) return;
        try {
            setIsLoadingLigas(true);
            setErrorLigas(null);
            const response = await fetch(`/api/ligas/mis-ligas?managerId=${manager.idManager}`);
            if (!response.ok) throw new Error('Error al obtener las ligas');
            const data = await response.json();
            setLigas(data.ligas);
            if (data.ligas.length > 0) setSelectedLigaId(data.ligas[0].idLigas);
        } catch (err) {
            console.error("Fallo al obtener las ligas:", err);
            setErrorLigas('Fallo al obtener las ligas. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoadingLigas(false);
        }
    };

    useEffect(() => { fetchLigas(); }, [manager]);

    useEffect(() => {
        if (!selectedLigaId) return;
        const fetchClasificacion = async () => {
            try {
                setIsLoadingClasificacion(true);
                setErrorClasificacion(null);
                const response = await fetch(`/api/ligas/${selectedLigaId}/clasificacion`);
                if (!response.ok) throw new Error('Error al obtener la clasificación');
                const data = await response.json();
                setClasificacion(data.clasificacion);
                setLigaInfo(data.liga ?? null);
            } catch (err) {
                console.error("Fallo al obtener la clasificación:", err);
                setErrorClasificacion('Fallo al obtener la clasificación. Por favor, inténtalo de nuevo.');
            } finally {
                setIsLoadingClasificacion(false);
            }
        };
        fetchClasificacion();
    }, [selectedLigaId]);

    const handleCreateLiga = async (nombreLiga: string, tipo: 'privada' | 'club', idEquipo: number | null) => {
        if (!manager?.idManager) {
            setErrorCreate("No se pudo obtener el ID del manager. Por favor, recarga la página.");
            return;
        }
        setIsLoadingCreate(true);
        setErrorCreate(null);
        try {
            const response = await fetch('/api/ligas/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreLiga, managerId: manager.idManager, tipo, idEquipo }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al crear la liga.');
            await fetchLigas();
            setSelectedLigaId(data.liga.idLigas);
            setShowCreateLigaModal(false);
        } catch (err: any) {
            console.error("Fallo al crear la liga:", err);
            setErrorCreate(err.message);
        } finally {
            setIsLoadingCreate(false);
        }
    };

    const handleJoinLiga = async (codigo: string) => {
        if (!manager?.idManager) {
            setErrorJoin("No se pudo obtener el ID del manager. Por favor, recarga la página.");
            return;
        }
        setIsLoadingJoin(true);
        setErrorJoin(null);
        try {
            const response = await fetch('/api/ligas/unirse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, managerId: manager.idManager }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al unirte a la liga.');
            setToast({ message: data.message || '¡Te has unido a la liga!', type: 'success' });
            await fetchLigas();
            setShowJoinLigaModal(false);
        } catch (err: any) {
            console.error("Fallo al unirse a la liga:", err);
            setErrorJoin(err.message);
        } finally {
            setIsLoadingJoin(false);
        }
    };

    const copyToClipboard = () => {
        if (selectedLiga?.Codigo) {
            navigator.clipboard.writeText(selectedLiga.Codigo);
            setToast({ message: 'Código copiado al portapapeles', type: 'info' });
        }
    };

    return {
        manager,
        ligas,
        isLoadingLigas,
        errorLigas,
        selectedLigaId,
        setSelectedLigaId,
        clasificacion,
        ligaInfo,
        isLoadingClasificacion,
        errorClasificacion,
        showCreateLigaModal,
        setShowCreateLigaModal,
        isLoadingCreate,
        errorCreate,
        showJoinLigaModal,
        setShowJoinLigaModal,
        isLoadingJoin,
        errorJoin,
        showCodigo,
        setShowCodigo,
        toast,
        setToast,
        selectedLiga,
        handleCreateLiga,
        handleJoinLiga,
        copyToClipboard,
    };
}
