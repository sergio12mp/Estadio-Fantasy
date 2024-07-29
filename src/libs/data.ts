export interface Jugador {
    idJugador: number;
    Nombre: string;
    Edad: string;
    Pais: string;
    Posicion: string;
    Precio: number;
    idEquipo: number;
}
export interface Equipo {
    idEquipo: number;
    Nombre: string;
}

export interface Manager {
    idManager: number;
}

export interface Ligas {
    idLigas: number;
    Nombre: string;
}



export interface Objetos {
    idObjetos: number;
    Nombre: string;
    Precio: number;
    Descripcion: string;
}

export interface Participaciones {
    idManager: number;
    idLigas: number;
}
export interface Partido {
    idPartido: number;
    idJornada: number;
    idEquipoLocal: number;
    idEquipoVisitante: number;
}

export interface PlantillaJugadorObjeto {
    idPlantilla: number;
    idJugador: number;
    idObjetos: number;
}
export interface Plantilla {
    idPlantilla: number;
    Alineacion: string;
    Puntos: number;
    idJornada: number;
    idManager: number;
}

export interface Jornada {
    idJornada: number;
    Nombre: string;
    idTemporada: number;
}

export 
interface Estadisticas {
    idEstadisticas: number;
    idPartido: number;
    idJornada: number;
    idJugador: number;
    idEquipo: number;
    Minutos: number;
    Goles: number;
    Asistencias: number;
    TirosPenalti: number;
    TirosPenaltiIntentados: number;
    Disparos: number;
    DisparosPorteria: number;
    TarjetasAmarillas: number;
    TarjetasRojas: number;
    Toques: number;
    Entradas: number;
    Intercepciones: number;
    Bloqueos: number;
    GolesEsperados: number;
    GolesEsperadosSinPenaltis: number;
    AsistenciasEsperadas: number;
    AccionesCreadasDeTiro: number;
    AccionesCreadasDeGol: number;
    PasesCompletados: number;
    PasesIntentados: number;
    PorcentajePasesCompletados: number;
    PasesProgresivos: number;
    Controles: number;
    ConduccionesProgresivas: number;
    EntradasOfensivas: number;
    EntradasConExito: number;
}