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
  slug?: string | null;
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

export interface TiendaItem {
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
