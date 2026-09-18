// app/mi-equipo/page.tsx
'use client';

import RequireAuth from '@/components/ui/RequireAuth';
import React, { useMemo } from 'react';
import PlayerCard from '@/components/team/playerCard';
import PlayerSelectionModal from '@/components/team/playerSelectionModal';
import ObjectSelectionModal from '@/components/team/objectSelectionModal';
import Toast from '@/components/ui/Toast';
import PageLayout from '@/components/layout/PageLayout';
import { PosicionFrontend } from '@/lib/data';
import { FORMACIONES } from '@/lib/formations';
import { COSTE_BASE_USO } from '@/lib/constants';
import { useMiEquipo } from '@/hooks/useMiEquipo';
import { cn } from '@/lib/utils';

export default function MiEquipo() {
  const {
    manager,
    authLoading,
    isLoading,
    error,
    toast,
    setToast,
    cartasJugadorManagerDB,
    cartasObjetoManagerDB,
    plantillaActual,
    isPlayerSelectionModalOpen,
    selectedPositionForModal,
    selectedSlotIndex,
    isObjectSelectionModalOpen,
    playerForObjectSelection,
    playerIndexForObjectSelection,
    modalInitialPlayer,
    modalInitialObjects,
    selectedFormationLabel,
    setSelectedFormationLabel,
    puntosJornada,
    jornadasDisponibles,
    selectedJornada,
    setSelectedJornada,
    costes,
    limiteUso,
    isEditingAllowed,
    currentFormation,
    totalSlots,
    usoTotal,
    availablePlayersForSelection,
    handleOpenPlayerSelectionModal,
    handleReconfigurePlayer,
    handleClosePlayerSelectionModal,
    handlePlayerSelected,
    handleOpenObjectSelectionModal,
    handleCloseObjectSelectionModal,
    handleConfirmEquipObjects,
    handleGuardarPlantilla,
  } = useMiEquipo();

  const renderPlantillaSlots = useMemo(() => {
    if (!currentFormation) return [];

    const rows: JSX.Element[] = [];
    let globalIndex = 0;

    currentFormation.order.forEach((posicionFrontend: PosicionFrontend) => {
      const count = currentFormation.positions[posicionFrontend];
      const rowSlots: JSX.Element[] = [];

      for (let i = 0; i < count; i++) {
        const currentIndex = globalIndex;
        const currentPlayer = plantillaActual.get(currentIndex);
        rowSlots.push(
          <div
            key={currentIndex}
            className="relative min-w-0 rounded-xl flex flex-col items-center justify-start p-0.5 md:p-1 text-white shadow-md border border-white/10"
          >
            {currentPlayer ? (
              <>
                <PlayerCard
                  carta={currentPlayer}
                  fieldMode
                  onClick={isEditingAllowed ? () =>
                    handleReconfigurePlayer(currentPlayer, currentIndex, posicionFrontend)
                  : undefined}
                  onEquipObject={() => {
                    handleOpenObjectSelectionModal(currentPlayer, currentIndex);
                  }}
                />
                <div className="mt-0.5 text-[9px] md:text-[10px] text-white/70 text-center">
                  Uso: {costes[currentPlayer.idJugador]?.costeTotal ?? (COSTE_BASE_USO[currentPlayer.Rareza] ?? 1)}
                </div>
              </>
            ) : (
              <button
                className={cn(
                  "w-full flex flex-col items-center gap-1 py-3 rounded-lg transition-colors",
                  isEditingAllowed
                    ? "hover:bg-green-500/20 cursor-pointer"
                    : "cursor-default opacity-50"
                )}
                onClick={isEditingAllowed ? () => handleOpenPlayerSelectionModal(posicionFrontend, currentIndex) : undefined}
                disabled={!isEditingAllowed}
                aria-label={isEditingAllowed ? `Añadir ${posicionFrontend}` : undefined}
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-[10px] font-bold border border-dashed border-white/20">
                  {posicionFrontend}
                </div>
                {isEditingAllowed && (
                  <span className="text-[10px] text-green-400 font-medium">+ Añadir</span>
                )}
              </button>
            )}
          </div>
        );
        globalIndex++;
      }

      rows.push(
        <div
          key={`row-${posicionFrontend}-${globalIndex}`}
          className="mb-2 md:mb-4 px-1"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '4px' }}
        >
          {rowSlots}
        </div>
      );
    });

    return rows;
  }, [plantillaActual, currentFormation, handleReconfigurePlayer, handleOpenObjectSelectionModal, isEditingAllowed, costes]);

  if (authLoading || isLoading) {
    return (
      <PageLayout className="flex items-center justify-center">
        <p className="text-muted-foreground">Cargando equipo...</p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout className="flex items-center justify-center">
        <p className="text-destructive font-semibold">Error: {error}</p>
      </PageLayout>
    );
  }

  if (!manager) {
    return (
      <PageLayout className="flex flex-col items-center justify-center">
        <p>Por favor, inicia sesión para ver tu equipo.</p>
      </PageLayout>
    );
  }

  return (
    <RequireAuth>
      <PageLayout noPadding className="bg-gray-900 text-white">
        <div className="px-3 md:px-6 py-4">
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-6">Mi Equipo</h1>

          <div className="max-w-7xl mx-auto bg-gray-800 p-3 md:p-6 rounded-lg shadow-xl">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
              {/* Selects en una fila en móvil */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="alineacion-select" className="text-sm text-gray-300 whitespace-nowrap">
                    Alineación:
                  </label>
                  <select
                    id="alineacion-select"
                    className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-white text-sm"
                    value={selectedFormationLabel}
                    onChange={(e) => setSelectedFormationLabel(e.target.value)}
                  >
                    {FORMACIONES.map((f) => (
                      <option key={f.label} value={f.label}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="jornada-select" className="text-sm text-gray-300 whitespace-nowrap">
                    Jornada:
                  </label>
                  <select
                    id="jornada-select"
                    className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-white text-sm"
                    value={selectedJornada ?? ''}
                    onChange={(e) => setSelectedJornada(parseInt(e.target.value))}
                  >
                    {jornadasDisponibles.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleGuardarPlantilla}
                disabled={!isEditingAllowed}
                className={cn(
                  "w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md transition-colors text-sm",
                  !isEditingAllowed && "opacity-50 cursor-not-allowed"
                )}
              >
                Guardar Plantilla
              </button>
            </div>

            {/* Stats bar */}
            <div className="text-sm mb-3 flex flex-wrap justify-center gap-4">
              <span className="text-gray-300">
                Jugadores: <strong>{plantillaActual.size}/{totalSlots}</strong>
              </span>
              <span className={cn(
                "font-bold",
                usoTotal > limiteUso ? 'text-red-400' :
                usoTotal > limiteUso * 0.85 ? 'text-yellow-400' :
                'text-green-400'
              )}>
                Uso: {usoTotal}/{limiteUso}
              </span>
              {puntosJornada != null && (
                <span className="text-yellow-400 font-bold">
                  Puntos J{selectedJornada}: {puntosJornada}
                </span>
              )}
            </div>

            {!isEditingAllowed && selectedJornada !== null && (
              <div className="mb-3 p-3 bg-yellow-900/50 border border-yellow-600/60 rounded-lg text-center text-yellow-300 text-xs font-medium">
                Estás viendo la jornada {selectedJornada}. Para editar, selecciona la jornada actual.
              </div>
            )}

            {usoTotal > limiteUso && (
              <div className="mb-3 p-3 bg-red-900/60 border border-red-500 rounded-lg text-center text-red-300 text-xs font-medium">
                El uso total ({usoTotal}) supera el límite de {limiteUso}. Cambia jugadores por cartas de menor rareza.
              </div>
            )}

            {/* Campo de fútbol */}
            <div
              className="relative rounded-xl overflow-hidden border-4 border-green-600/40"
              style={{
                background: 'repeating-linear-gradient(to bottom, #166534, #166534 60px, #15803d 60px, #15803d 120px)',
              }}
            >
              {/* Línea del medio */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
              {/* Círculo central */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/20" />
              <div className="py-4 md:py-6 px-2 md:px-4">
                {renderPlantillaSlots}
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}

        {isPlayerSelectionModalOpen && selectedPositionForModal && selectedSlotIndex !== null && (
          <PlayerSelectionModal
            position={selectedPositionForModal}
            availablePlayers={availablePlayersForSelection}
            availableObjects={cartasObjetoManagerDB}
            onClose={handleClosePlayerSelectionModal}
            onConfirm={handlePlayerSelected}
            initialPlayer={modalInitialPlayer}
            initialObjects={modalInitialObjects}
          />
        )}

        {isObjectSelectionModalOpen && playerForObjectSelection && playerIndexForObjectSelection !== null && (
          <ObjectSelectionModal
            jugador={playerForObjectSelection}
            availableObjects={cartasObjetoManagerDB}
            onClose={handleCloseObjectSelectionModal}
            onConfirmEquip={handleConfirmEquipObjects}
          />
        )}
      </PageLayout>
    </RequireAuth>
  );
}
