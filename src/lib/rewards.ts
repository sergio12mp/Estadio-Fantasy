// src/lib/rewards.ts
// Cálculo de recompensas en balones al vender cartas.
// Centralizado para que la lógica sea consistente entre el cliente y el servidor.

/**
 * Balones que recibe el manager al vender una carta de jugador.
 * Las cartas Comunes de jugador no se pueden vender (retorna 0, pero la API lo bloquea).
 */
export function rewardJugador(rareza: string): number {
  switch (rareza) {
    case 'Comun':
    case 'Común':
      return 3;
    case 'Raro':
    case 'Rara':
      return 10;
    case 'Epico':
    case 'Épico':
    case 'Epica':
    case 'Épica':
      return 20;
    case 'Legendario':
    case 'Legendaria':
      return 40;
    default:
      return 0;
  }
}

/**
 * Balones que recibe el manager al vender una carta de objeto.
 */
export function rewardObjeto(rareza: string): number {
  switch (rareza) {
    case 'Comun':
    case 'Común':
      return 5;
    case 'Raro':
    case 'Rara':
      return 10;
    case 'Epico':
    case 'Épico':
    case 'Epica':
    case 'Épica':
      return 15;
    case 'Legendario':
    case 'Legendaria':
      return 20;
    default:
      return 0;
  }
}

/**
 * Valor de venta visible en el álbum para una carta de jugador (en balones).
 */
export function valorVentaJugador(rareza: string): number {
  return rewardJugador(rareza);
}

/**
 * Valor de venta visible en el álbum para una carta de objeto (en balones).
 */
export function valorVentaObjeto(rareza: string): number {
  return rewardObjeto(rareza);
}
