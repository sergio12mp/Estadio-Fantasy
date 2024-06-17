-- Inserción en la tabla Estadisticas
INSERT INTO `mydb`.`Estadisticas` 
(`Minutos`, `Goles`, `Asistencias`, `TirosPenalti`, `TirosPenaltiIntentados`, 
 `Disparos`, `DisparosPorteria`, `TarjetasAmarillas`, `TarjetasRojas`, `Toques`, 
 `Entradas`, `Intercepciones`, `Bloqueos`, `GolesEsperados`, `GolesEsperadosSinPenaltis`, 
 `AsistenciasEsperadas`, `AccionesCreadasDeTiro`, `AccionesCreadasDeGol`, `PasesCompletados`, 
 `PasesIntentados`, `PorcentajePasesCompletados`, `PasesProgresivos`, `Controles`, 
 `ConduccionesProgresivas`, `EntradasOfensivas`, `EntradasConExito`) 
VALUES 
('90', '2', '1', '1', '2', '5', '3', '1', '0', '50', 
 '10', '5', '1', 0.75, '0.50', '1', '2', '1', '30', 
 '40', '75%', '5', '10', '3', '2', '1');

-- Inserción en la tabla Ligas
INSERT INTO `mydb`.`Ligas` (`Nombre`, `Descripcion`) 
VALUES ('Liga 1', 'Primera División');

-- Inserción en la tabla Objeto
INSERT INTO `mydb`.`Objeto` (`idObjeto`, `Nombre`, `Descripcion`) 
VALUES (1, 'Balón de Oro', 'Premio al mejor jugador');

-- Inserción en la tabla Equipo
INSERT INTO `mydb`.`Equipo` (`Nombre`, `Estadisticas_idEstadisticas`) 
VALUES ('Equipo A', 1);

-- Inserción en la tabla Partidos
INSERT INTO `mydb`.`Partidos` (`Fecha`, `Jornada_idJornada`, `Estadisticas_idEstadisticas`) 
VALUES ('2024-06-01', 1, 1);

-- Inserción en la tabla Jugador
INSERT INTO `mydb`.`Jugador` 
(`Nombre`, `Pais`, `Posicion`, `Edad`, `Estadisticas_idEstadisticas`, 
 `Estadisticas_idEstadisticas1`, `Equipo_idEquipo`, `Equipo_Estadisticas_idEstadisticas`, `CartaJugador_idCartaJugador`) 
VALUES 
('Juan Pérez', 'Argentina', 'Delantero', '25', 1, 1, 1, 1, 1);

-- Inserción en la tabla Plantilla
INSERT INTO `mydb`.`Plantilla` 
(`Puntos`, `Alineacion`, `Manager_idManager`, `Manager_CartaJugador_idCartaJugador`, 
 `Manager_CartaJugador_Jugador_idJugador`, `Manager_CartaJugador_Jugador_Estadisticas_idEstadisticas`, `Manager_idManager1`) 
VALUES 
('45', '4-4-2', 1, 1, 1, 1, 1);

-- Inserción en la tabla Jornada
INSERT INTO `mydb`.`Jornada` (`Numero`, `Plantilla_idPlantilla`, `Plantilla_Manager_idManager1`) 
VALUES ('1', 1, 1);

-- Inserción en la tabla CartaJugador
INSERT INTO `mydb`.`CartaJugador` 
(`Jugador_idJugador`, `Jugador_Estadisticas_idEstadisticas`, `Plantilla_idPlantilla`, `Plantilla_Manager_idManager1`) 
VALUES 
(1, 1, 1, 1);

-- Inserción en la tabla Manager
INSERT INTO `mydb`.`Manager` 
(`CartaJugador_idCartaJugador`, `CartaJugador_Jugador_idJugador`, `CartaJugador_Jugador_Estadisticas_idEstadisticas`, 
 `CartaJugador_idCartaJugador1`, `CartaJugador_Plantilla_idPlantilla`, `CartaJugador_Plantilla_Manager_idManager1`) 
VALUES 
(1, 1, 1, 1, 1, 1);

-- Inserción en la tabla Objeto_has_Manager
INSERT INTO `mydb`.`Objeto_has_Manager` (`Objeto_idObjeto`, `Manager_idManager`) 
VALUES (1, 1);

-- Inserción en la tabla Objeto_has_CartaJugador
INSERT INTO `mydb`.`Objeto_has_CartaJugador` (`Objeto_idObjeto`, `CartaJugador_idCartaJugador`) 
VALUES (1, 1);

-- Inserción en la tabla Manager_has_Ligas
INSERT INTO `mydb`.`Manager_has_Ligas` (`Manager_idManager`, `Ligas_idLigas`) 
VALUES (1, 1);
