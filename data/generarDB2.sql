-- ============================================================
-- Estadio Fantasy — Script de creación completo de base de datos
-- Versión 2.1 — Corregido y con datos semilla
-- ============================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mydb`;

-- -----------------------------------------------------
-- Table `mydb`.`Equipo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Equipo`;

CREATE TABLE IF NOT EXISTS `mydb`.`Equipo` (
  `idEquipo`  INT          NOT NULL AUTO_INCREMENT,
  `Nombre`    VARCHAR(200) NULL DEFAULT NULL,
  PRIMARY KEY (`idEquipo`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Jugador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Jugador`;

CREATE TABLE IF NOT EXISTS `mydb`.`Jugador` (
  `idJugador` INT         NOT NULL AUTO_INCREMENT,
  `Nombre`    VARCHAR(45) NULL DEFAULT NULL,
  `Edad`      VARCHAR(45) NULL DEFAULT NULL,
  `Pais`      VARCHAR(45) NULL DEFAULT NULL,
  `Posicion`  VARCHAR(45) NULL DEFAULT NULL,
  `Precio`    INT         NULL DEFAULT NULL,
  `idEquipo`  INT         NULL DEFAULT NULL,
  PRIMARY KEY (`idJugador`),
  INDEX `idx_Jugador_idEquipo` (`idEquipo` ASC),
  UNIQUE INDEX `uq_Jugador_idJugador_idEquipo` (`idJugador`, `idEquipo`),
  CONSTRAINT `fk_Jugador_Equipo`
    FOREIGN KEY (`idEquipo`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Temporada`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Temporada`;

CREATE TABLE IF NOT EXISTS `mydb`.`Temporada` (
  `idTemporada` INT          NOT NULL AUTO_INCREMENT,
  `Nombre`      VARCHAR(200) NULL DEFAULT NULL,
  PRIMARY KEY (`idTemporada`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Jornada`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Jornada`;

CREATE TABLE IF NOT EXISTS `mydb`.`Jornada` (
  `idJornada`   INT         NOT NULL AUTO_INCREMENT,
  `Nombre`      VARCHAR(45) NULL DEFAULT NULL,
  `idTemporada` INT         NOT NULL,
  PRIMARY KEY (`idJornada`),
  INDEX `idx_Jornada_idTemporada` (`idTemporada` ASC),
  CONSTRAINT `fk_Jornada_Temporada`
    FOREIGN KEY (`idTemporada`)
    REFERENCES `mydb`.`Temporada` (`idTemporada`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Partido`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Partido`;

CREATE TABLE IF NOT EXISTS `mydb`.`Partido` (
  `idPartido`         INT NOT NULL AUTO_INCREMENT,
  `idJornada`         INT NULL DEFAULT NULL,
  `idEquipoLocal`     INT NULL DEFAULT NULL,
  `idEquipoVisitante` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idPartido`),
  INDEX `idx_Partido_idJornada`         (`idJornada` ASC),
  INDEX `idx_Partido_idEquipoLocal`     (`idEquipoLocal` ASC),
  INDEX `idx_Partido_idEquipoVisitante` (`idEquipoVisitante` ASC),
  UNIQUE INDEX `uq_Partido_idPartido_idJornada` (`idPartido`, `idJornada`),
  CONSTRAINT `fk_Partido_Jornada`
    FOREIGN KEY (`idJornada`)
    REFERENCES `mydb`.`Jornada` (`idJornada`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Partido_EquipoLocal`
    FOREIGN KEY (`idEquipoLocal`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Partido_EquipoVisitante`
    FOREIGN KEY (`idEquipoVisitante`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Estadisticas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Estadisticas`;

CREATE TABLE IF NOT EXISTS `mydb`.`Estadisticas` (
  `idEstadisticas`               INT   NOT NULL AUTO_INCREMENT,
  `idPartido`                    INT   NULL DEFAULT NULL,
  `idJornada`                    INT   NULL DEFAULT NULL,
  `idJugador`                    INT   NULL DEFAULT NULL,
  `idEquipo`                     INT   NULL DEFAULT NULL,
  `Minutos`                      INT   NULL,
  `Goles`                        INT   NULL,
  `Asistencias`                  INT   NULL,
  `TirosPenalti`                 INT   NULL,
  `TirosPenaltiIntentados`       INT   NULL,
  `Disparos`                     INT   NULL,
  `DisparosPorteria`             INT   NULL,
  `TarjetasAmarillas`            INT   NULL,
  `TarjetasRojas`                INT   NULL,
  `Toques`                       INT   NULL,
  `Entradas`                     INT   NULL,
  `Intercepciones`               INT   NULL,
  `Bloqueos`                     INT   NULL,
  `GolesEsperados`               FLOAT NULL,
  `GolesEsperadosSinPenaltis`    FLOAT NULL,
  `AsistenciasEsperadas`         FLOAT NULL,
  `AccionesCreadasDeTiro`        INT   NULL,
  `AccionesCreadasDeGol`         INT   NULL,
  `PasesCompletados`             INT   NULL,
  `PasesIntentados`              INT   NULL,
  `PorcentajePasesCompletados`   FLOAT NULL,
  `PasesProgresivos`             INT   NULL,
  `Controles`                    INT   NULL,
  `ConduccionesProgresivas`      INT   NULL,
  `EntradasOfensivas`            INT     NULL,
  `EntradasConExito`             INT     NULL,
  `Paradas`                      INT     NULL DEFAULT NULL,
  `GolesEncajados`               INT     NULL DEFAULT NULL,
  `PorteriaACero`                TINYINT NULL DEFAULT NULL,
  `PSxGPortero`                  FLOAT   NULL DEFAULT NULL,
  `PenaltisParados`              INT     NULL DEFAULT NULL,
  `Puntos`                       FLOAT   NULL DEFAULT NULL,
  PRIMARY KEY (`idEstadisticas`),
  INDEX `idx_Estadisticas_PartidoJornada`  (`idPartido`, `idJornada`),
  INDEX `idx_Estadisticas_JugadorEquipo`   (`idJugador`, `idEquipo`),
  CONSTRAINT `fk_Estadisticas_Partido`
    FOREIGN KEY (`idPartido`, `idJornada`)
    REFERENCES `mydb`.`Partido` (`idPartido`, `idJornada`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Estadisticas_JugadorEquipo`
    FOREIGN KEY (`idJugador`, `idEquipo`)
    REFERENCES `mydb`.`Jugador` (`idJugador`, `idEquipo`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Manager`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Manager`;

CREATE TABLE IF NOT EXISTS `mydb`.`Manager` (
  `idManager`         INT          NOT NULL AUTO_INCREMENT,
  `Nombre`            VARCHAR(45)  NULL,
  `idGoogle`          VARCHAR(100) NULL,
  `Email`             VARCHAR(100) NULL,
  `esAdmin`           BOOLEAN      NOT NULL DEFAULT FALSE,
  `oro`               INT          NOT NULL DEFAULT 0,
  `balones`           INT          NOT NULL DEFAULT 0,
  `puntuacion_actual` INT          NOT NULL DEFAULT 0,
  `pity`              INT          NOT NULL DEFAULT 0,
  `isBot`             TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (`idManager`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Plantilla`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Plantilla`;

CREATE TABLE IF NOT EXISTS `mydb`.`Plantilla` (
  `idPlantilla` INT         NOT NULL AUTO_INCREMENT,
  `Alineacion`  VARCHAR(45) NULL DEFAULT NULL,
  `Puntos`      INT         NULL DEFAULT NULL,
  `idJornada`   INT         NULL DEFAULT NULL,
  `idManager`   INT         NULL DEFAULT NULL,
  PRIMARY KEY (`idPlantilla`),
  INDEX `idx_Plantilla_idJornada` (`idJornada` ASC),
  INDEX `idx_Plantilla_idManager` (`idManager` ASC),
  CONSTRAINT `fk_Plantilla_Jornada`
    FOREIGN KEY (`idJornada`)
    REFERENCES `mydb`.`Jornada` (`idJornada`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Plantilla_Manager`
    FOREIGN KEY (`idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Objetos`
-- Tipo:        categoría estética (Botas, Guantes, Cintillo, Brazalete, Bidón,
--              Escudo, Balón, Capa, Armadura, Lentes, Corona)
-- Efecto:      'multiplicador' | 'suma'
-- ValorEfecto: multiplicador (>1 amplía, <1 reduce penalización) o pts planos por suma
-- Estadistica: nombre exacto de la columna en Estadisticas a la que se aplica
-- Rareza:      'Comun' | 'Rara' | 'Epica' | 'Legendaria'
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Objetos`;

CREATE TABLE IF NOT EXISTS `mydb`.`Objetos` (
  `idObjetos`   INT          NOT NULL AUTO_INCREMENT,
  `Nombre`      VARCHAR(100) NULL DEFAULT NULL,
  `Precio`      INT          NULL DEFAULT NULL,
  `Descripcion` VARCHAR(500) NULL DEFAULT NULL,
  `Tipo`        VARCHAR(45)  NULL DEFAULT NULL,
  `Efecto`      VARCHAR(45)  NULL DEFAULT NULL,
  `ValorEfecto` FLOAT        NOT NULL DEFAULT 1.0,
  `Estadistica` VARCHAR(45)  NULL DEFAULT NULL,
  `Rareza`      VARCHAR(45)  NOT NULL DEFAULT 'Comun',
  PRIMARY KEY (`idObjetos`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Ligas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Ligas`;

CREATE TABLE IF NOT EXISTS `mydb`.`Ligas` (
  `idLigas`  INT          NOT NULL AUTO_INCREMENT,
  `Nombre`   VARCHAR(45)  NULL DEFAULT NULL,
  `Codigo`   VARCHAR(100) NULL DEFAULT NULL,
  `tipo`     VARCHAR(45)  NOT NULL DEFAULT 'privada',
  `idEquipo` INT          NULL DEFAULT NULL,
  PRIMARY KEY (`idLigas`),
  CONSTRAINT `fk_Ligas_Equipo`
    FOREIGN KEY (`idEquipo`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Manager_Ligas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Manager_Ligas`;

CREATE TABLE IF NOT EXISTS `mydb`.`Manager_Ligas` (
  `Manager_idManager` INT   NOT NULL,
  `Ligas_idLigas`     INT   NOT NULL,
  `puntuacion_actual` FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (`Manager_idManager`, `Ligas_idLigas`),
  INDEX `idx_ML_idLigas`   (`Ligas_idLigas` ASC),
  INDEX `idx_ML_idManager` (`Manager_idManager` ASC),
  CONSTRAINT `fk_ML_Manager`
    FOREIGN KEY (`Manager_idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_ML_Ligas`
    FOREIGN KEY (`Ligas_idLigas`)
    REFERENCES `mydb`.`Ligas` (`idLigas`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`CartaObjeto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`CartaObjeto`;

CREATE TABLE IF NOT EXISTS `mydb`.`CartaObjeto` (
  `idCartaObjeto` INT         NOT NULL AUTO_INCREMENT,
  `idObjetos`     INT         NOT NULL,
  `idManager`     INT         NOT NULL,
  `Rareza`        VARCHAR(45) NOT NULL DEFAULT 'Comun',
  PRIMARY KEY (`idCartaObjeto`),
  UNIQUE INDEX `idCartaObjeto_UNIQUE` (`idCartaObjeto`),
  INDEX `idx_CartaObjeto_idObjetos` (`idObjetos` ASC),
  INDEX `idx_CartaObjeto_idManager` (`idManager` ASC),
  CONSTRAINT `fk_CartaObjeto_Objetos`
    FOREIGN KEY (`idObjetos`)
    REFERENCES `mydb`.`Objetos` (`idObjetos`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_CartaObjeto_Manager`
    FOREIGN KEY (`idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`CartaJugador`
-- CORRECCIÓN: Se añade columna Rareza (requerida por sobres, álbum y registro)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`CartaJugador`;

CREATE TABLE IF NOT EXISTS `mydb`.`CartaJugador` (
  `idCartaJugador`   INT         NOT NULL AUTO_INCREMENT,
  `Jugador_idJugador` INT        NOT NULL,
  `Manager_idManager` INT        NOT NULL,
  `Rareza`           VARCHAR(45) NOT NULL DEFAULT 'Comun',
  PRIMARY KEY (`idCartaJugador`),
  INDEX `idx_CartaJugador_Jugador` (`Jugador_idJugador` ASC),
  INDEX `idx_CartaJugador_Manager` (`Manager_idManager` ASC),
  CONSTRAINT `fk_CartaJugador_Jugador`
    FOREIGN KEY (`Jugador_idJugador`)
    REFERENCES `mydb`.`Jugador` (`idJugador`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_CartaJugador_Manager`
    FOREIGN KEY (`Manager_idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PlantillaJugadorObjeto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PlantillaJugadorObjeto`;

CREATE TABLE IF NOT EXISTS `mydb`.`PlantillaJugadorObjeto` (
  `idPlantilla`        INT NOT NULL,
  `idCartaJugador`     INT NOT NULL,
  `idCartaObjeto1`     INT NULL DEFAULT NULL,
  `idCartaObjeto2`     INT NULL DEFAULT NULL,
  `idCartaObjeto3`     INT NULL DEFAULT NULL,
  `posicionEnPlantilla` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`idPlantilla`, `idCartaJugador`),
  INDEX `idx_PJO_Plantilla`    (`idPlantilla` ASC),
  INDEX `idx_PJO_CartaObjeto`  (`idCartaObjeto` ASC),
  INDEX `idx_PJO_CartaJugador` (`idCartaJugador` ASC),
  CONSTRAINT `fk_PJO_Plantilla`
    FOREIGN KEY (`idPlantilla`)
    REFERENCES `mydb`.`Plantilla` (`idPlantilla`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_PJO_CartaObjeto`
    FOREIGN KEY (`idCartaObjeto`)
    REFERENCES `mydb`.`CartaObjeto` (`idCartaObjeto`)
    ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_PJO_CartaJugador`
    FOREIGN KEY (`idCartaJugador`)
    REFERENCES `mydb`.`CartaJugador` (`idCartaJugador`)
    ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- ============================================================
-- DATOS SEMILLA
-- ============================================================

-- Temporada actual
INSERT INTO `mydb`.`Temporada` (`Nombre`) VALUES ('LaLiga 2024-25');

-- Jornadas (38 jornadas de LaLiga)
INSERT INTO `mydb`.`Jornada` (`Nombre`, `idTemporada`) VALUES
  ('Jornada 1',  1), ('Jornada 2',  1), ('Jornada 3',  1), ('Jornada 4',  1),
  ('Jornada 5',  1), ('Jornada 6',  1), ('Jornada 7',  1), ('Jornada 8',  1),
  ('Jornada 9',  1), ('Jornada 10', 1), ('Jornada 11', 1), ('Jornada 12', 1),
  ('Jornada 13', 1), ('Jornada 14', 1), ('Jornada 15', 1), ('Jornada 16', 1),
  ('Jornada 17', 1), ('Jornada 18', 1), ('Jornada 19', 1), ('Jornada 20', 1),
  ('Jornada 21', 1), ('Jornada 22', 1), ('Jornada 23', 1), ('Jornada 24', 1),
  ('Jornada 25', 1), ('Jornada 26', 1), ('Jornada 27', 1), ('Jornada 28', 1),
  ('Jornada 29', 1), ('Jornada 30', 1), ('Jornada 31', 1), ('Jornada 32', 1),
  ('Jornada 33', 1), ('Jornada 34', 1), ('Jornada 35', 1), ('Jornada 36', 1),
  ('Jornada 37', 1), ('Jornada 38', 1);

-- Equipos de LaLiga 2024-25
INSERT INTO `mydb`.`Equipo` (`Nombre`) VALUES
  ('Real Madrid'),        -- 1
  ('FC Barcelona'),       -- 2
  ('Atletico de Madrid'), -- 3
  ('Athletic Club'),      -- 4
  ('Real Sociedad'),      -- 5
  ('Real Betis'),         -- 6
  ('Villarreal CF'),      -- 7
  ('Valencia CF'),        -- 8
  ('Sevilla FC'),         -- 9
  ('Celta de Vigo'),      -- 10
  ('Girona FC'),          -- 11
  ('Getafe CF'),          -- 12
  ('Rayo Vallecano'),     -- 13
  ('Osasuna'),            -- 14
  ('Mallorca'),           -- 15
  ('Deportivo Alaves'),   -- 16
  ('Leganes'),            -- 17
  ('Espanyol'),           -- 18
  ('Las Palmas'),         -- 19
  ('Valladolid');         -- 20

-- ============================================================
-- Objetos del catálogo (80 objetos)
-- Columnas: Nombre, Precio, Descripcion, Tipo, Efecto, ValorEfecto, Estadistica, Rareza
--
-- Efecto 'multiplicador': ValorEfecto * puntos de esa estadística
--   > 1  → amplía puntos positivos  (e.g. 1.30 = +30%)
--   < 1  → reduce penalización negativa (e.g. 0.50 = mitad de la penalización)
-- Efecto 'suma': ValorEfecto puntos planos adicionales por cada ocurrencia
--
-- Estadistica: nombre exacto de la columna en la tabla Estadisticas
-- Rareza: Comun | Rara | Epica | Legendaria
-- ============================================================
INSERT INTO `mydb`.`Objetos`
  (`Nombre`, `Precio`, `Descripcion`, `Tipo`, `Efecto`, `ValorEfecto`, `Estadistica`, `Rareza`)
VALUES

-- ───────────── GOLES (8 objetos — stat más popular) ─────────────
('Tobillera del Artillero',   250, '+1 pto adicional por cada gol marcado. Para los finalizadores instintivos.',                                            'Botas',    'suma',          1.0,  'Goles', 'Comun'),
('Espinillera de Gol',        300, 'Multiplica x1.15 los puntos por goles marcados. El primer paso hacia la gloria.',                                       'Botas',    'multiplicador', 1.15, 'Goles', 'Comun'),
('Botines Predator',          750, '+2 ptos adicionales por cada gol. El botín de los delanteros más letales.',                                             'Botas',    'suma',          2.0,  'Goles', 'Rara'),
('Cintillo del Goleador',     800, 'Multiplica x1.30 los puntos por goles marcados. Para los referentes del ataque.',                                       'Cintillo', 'multiplicador', 1.30, 'Goles', 'Rara'),
('Bota de Oro del Crack',    2200, '+4 ptos adicionales por cada gol marcado. Para los depredadores del área rival.',                                       'Botas',    'suma',          4.0,  'Goles', 'Epica'),
('Botines del Depredador',   2500, 'Multiplica x1.55 los puntos por goles marcados. El instinto de matar en el área.',                                      'Botas',    'multiplicador', 1.55, 'Goles', 'Epica'),
('La Reliquia del 9',        6500, '+8 ptos adicionales por cada gol. Inscrita con los nombres de los mejores delanteros de la historia.',                  'Botas',    'suma',          8.0,  'Goles', 'Legendaria'),
('Corona del Pichichi',      7500, 'Multiplica x1.90 los puntos por goles marcados. Solo los mejores artilleros de la historia la merecen.',                'Corona',   'multiplicador', 1.90, 'Goles', 'Legendaria'),

-- ───────────── ASISTENCIAS (4 objetos — muy popular) ─────────────
('Brazalete del Pasador',     250, '+1 pto adicional por cada asistencia. Mejora la visión de juego del portador.',                                         'Brazalete','suma',          1.0,  'Asistencias', 'Comun'),
('Guante del Creador',        700, '+2 ptos adicionales por cada asistencia. El pase siempre encuentra al compañero.',                                      'Guantes',  'suma',          2.0,  'Asistencias', 'Rara'),
('Capa del Maestro Asistidor',2200,'+4 ptos adicionales por cada asistencia. Los grandes creadores de juego la llevan.',                                    'Capa',     'suma',          4.0,  'Asistencias', 'Epica'),
('El Bastón del Maestro',    6000, '+7 ptos adicionales por cada asistencia. La visión de juego de una leyenda viviente.',                                  'Capa',     'suma',          7.0,  'Asistencias', 'Legendaria'),

-- ───────────── DISPAROS (4 objetos) ─────────────
('Rótula Técnica',            250, 'Multiplica x1.15 los puntos por disparos realizados. El primer disparo siempre cuenta.',                                'Botas',    'multiplicador', 1.15, 'Disparos', 'Comun'),
('Muñequera del Tirador',     750, 'Multiplica x1.30 los puntos por disparos. Estabiliza el cuerpo en el momento del tiro.',                                'Brazalete','multiplicador', 1.30, 'Disparos', 'Rara'),
('Cañón de Precisión',       2200, 'Multiplica x1.55 los puntos por disparos. Solo los mejores tiradores dominan su potencia.',                             'Balón',    'multiplicador', 1.55, 'Disparos', 'Epica'),
('El Rifle del Francotirador',6000,'Multiplica x1.85 los puntos por disparos. Precisión legendaria desde cualquier ángulo del campo.',                      'Balón',    'multiplicador', 1.85, 'Disparos', 'Legendaria'),

-- ───────────── DISPAROS A PORTERÍA (4 objetos) ─────────────
('Visor del Delantero',       300, 'Multiplica x1.15 los puntos por disparos a portería. El objetivo siempre en el punto de mira.',                         'Lentes',   'multiplicador', 1.15, 'DisparosPorteria', 'Comun'),
('Lentes de Francotirador',   800, 'Multiplica x1.30 los puntos por disparos a portería. El portero nunca sabe por dónde viene.',                           'Lentes',   'multiplicador', 1.30, 'DisparosPorteria', 'Rara'),
('Ojo del Halcón',           2500, 'Multiplica x1.55 los puntos por disparos a portería. Como el ave, detecta el hueco perfecto.',                          'Lentes',   'multiplicador', 1.55, 'DisparosPorteria', 'Epica'),
('Retícula del Maestro',     6500, 'Multiplica x1.85 los puntos por disparos a portería. La portería no tiene secretos para él.',                           'Lentes',   'multiplicador', 1.85, 'DisparosPorteria', 'Legendaria'),

-- ───────────── PASES COMPLETADOS (4 objetos — popular) ─────────────
('Cintillo del Pasador',      250, 'Multiplica x1.15 los puntos por pases completados. La cabeza siempre en el juego.',                                     'Cintillo', 'multiplicador', 1.15, 'PasesCompletados', 'Comun'),
('Brazalete del Distribuidor',700, 'Multiplica x1.30 los puntos por pases completados. El motor que mueve al equipo.',                                      'Brazalete','multiplicador', 1.30, 'PasesCompletados', 'Rara'),
('Manos del Metrónomo',      2000, 'Multiplica x1.55 los puntos por pases completados. La precisión del reloj suizo.',                                      'Guantes',  'multiplicador', 1.55, 'PasesCompletados', 'Epica'),
('El Metrónomo',             5500, 'Multiplica x1.85 los puntos por pases completados. Controla el ritmo de todo el equipo.',                               'Cintillo', 'multiplicador', 1.85, 'PasesCompletados', 'Legendaria'),

-- ───────────── PASES PROGRESIVOS (4 objetos) ─────────────
('Brújula Táctica',           300, 'Multiplica x1.15 los puntos por pases progresivos. Siempre sabe hacia dónde avanzar.',                                  'Cintillo', 'multiplicador', 1.15, 'PasesProgresivos', 'Comun'),
('GPS del Mediocampista',     800, 'Multiplica x1.30 los puntos por pases progresivos. Siempre encuentra el espacio libre.',                                'Cintillo', 'multiplicador', 1.30, 'PasesProgresivos', 'Rara'),
('Radar del Mediocampista',  2500, 'Multiplica x1.55 los puntos por pases progresivos. Ve el campo como ningún otro jugador.',                              'Cintillo', 'multiplicador', 1.55, 'PasesProgresivos', 'Epica'),
('El Oráculo del Pase',      6500, 'Multiplica x1.85 los puntos por pases progresivos. El futuro del juego ya lo conoce de antemano.',                      'Capa',     'multiplicador', 1.85, 'PasesProgresivos', 'Legendaria'),

-- ───────────── ENTRADAS (4 objetos — popular defensas) ─────────────
('Rodillera del Defensor',    250, 'Multiplica x1.15 los puntos por entradas realizadas. Protege y ataca en igual medida.',                                 'Armadura', 'multiplicador', 1.15, 'Entradas', 'Comun'),
('Armadura del Stopper',      700, 'Multiplica x1.30 los puntos por entradas. El muro inamovible del centro de la defensa.',                                'Armadura', 'multiplicador', 1.30, 'Entradas', 'Rara'),
('Escudo del Defensor',      2000, 'Multiplica x1.55 los puntos por entradas. La defensa es un arte, y él es el artista.',                                  'Escudo',   'multiplicador', 1.55, 'Entradas', 'Epica'),
('La Muralla',               5500, 'Multiplica x1.85 los puntos por entradas. Nadie pasa por su zona sin pagar el precio.',                                 'Escudo',   'multiplicador', 1.85, 'Entradas', 'Legendaria'),

-- ───────────── INTERCEPCIONES (4 objetos) ─────────────
('Manoplas del Interceptor',  300, 'Multiplica x1.15 los puntos por intercepciones. Siempre en el lugar correcto en el momento preciso.',                   'Guantes',  'multiplicador', 1.15, 'Intercepciones', 'Comun'),
('Radar Defensivo',           800, 'Multiplica x1.30 los puntos por intercepciones. Anticipa cada pase del equipo rival.',                                  'Cintillo', 'multiplicador', 1.30, 'Intercepciones', 'Rara'),
('Visión de Lince',          2200, 'Multiplica x1.55 los puntos por intercepciones. Detecta el peligro antes de que ocurra.',                               'Lentes',   'multiplicador', 1.55, 'Intercepciones', 'Epica'),
('El Sexto Sentido',         6000, 'Multiplica x1.85 los puntos por intercepciones. Intuición sobrenatural en el campo de juego.',                          'Capa',     'multiplicador', 1.85, 'Intercepciones', 'Legendaria'),

-- ───────────── BLOQUEOS (4 objetos) ─────────────
('Escudo de Entrenamiento',   250, 'Multiplica x1.15 los puntos por bloqueos realizados. La primera línea de defensa del equipo.',                          'Escudo',   'multiplicador', 1.15, 'Bloqueos', 'Comun'),
('Escudo de Batalla',         700, 'Multiplica x1.28 los puntos por bloqueos. Probado en mil batallas tácticas.',                                           'Escudo',   'multiplicador', 1.28, 'Bloqueos', 'Rara'),
('Égida del Defensor',       2000, 'Multiplica x1.50 los puntos por bloqueos. Inspirado en los escudos de los guerreros griegos.',                          'Escudo',   'multiplicador', 1.50, 'Bloqueos', 'Epica'),
('La Fortaleza Inexpugnable',5500, 'Multiplica x1.80 los puntos por bloqueos. El jugador que nunca deja pasar el balón.',                                   'Escudo',   'multiplicador', 1.80, 'Bloqueos', 'Legendaria'),

-- ───────────── ACCIONES CREADAS DE GOL (4 objetos) ─────────────
('Visión de Juego Básica',    350, 'Multiplica x1.15 los puntos por acciones que crean ocasiones de gol. El instinto de crear peligro.',                    'Cintillo', 'multiplicador', 1.15, 'AccionesCreadasDeGol', 'Comun'),
('Mente Táctica Avanzada',    950, 'Multiplica x1.30 los puntos por acciones que crean ocasiones de gol. Lee el juego mejor que nadie.',                    'Cintillo', 'multiplicador', 1.30, 'AccionesCreadasDeGol', 'Rara'),
('El Arquitecto del Gol',    2800, 'Multiplica x1.55 los puntos por acciones que crean gol. Diseña jugadas de ataque maestras de forma instintiva.',        'Capa',     'multiplicador', 1.55, 'AccionesCreadasDeGol', 'Epica'),
('El Cerebro del Equipo',    7500, 'Multiplica x1.90 los puntos por acciones que crean gol. La mente maestra que lo controla todo desde la sombra.',        'Capa',     'multiplicador', 1.90, 'AccionesCreadasDeGol', 'Legendaria'),

-- ───────────── MINUTOS (4 objetos — universal) ─────────────
('Botella de Agua',           200, 'Multiplica x1.10 los puntos obtenidos por minutos jugados. Hidratación básica pero efectiva.',                          'Bidón',    'multiplicador', 1.10, 'Minutos', 'Comun'),
('Bidón Energético Pro',      600, 'Multiplica x1.22 los puntos por minutos jugados. Fórmula avanzada de recuperación física.',                             'Bidón',    'multiplicador', 1.22, 'Minutos', 'Rara'),
('Suplemento de Élite',      1800, 'Multiplica x1.42 los puntos por minutos jugados. Los suplementos de los atletas olímpicos.',                            'Bidón',    'multiplicador', 1.42, 'Minutos', 'Epica'),
('Néctar de los Dioses',     5500, 'Multiplica x1.70 los puntos por minutos jugados. La bebida que da vida eterna a las piernas.',                          'Bidón',    'multiplicador', 1.70, 'Minutos', 'Legendaria'),

-- ───────────── CONTROLES (4 objetos) ─────────────
('Vendas del Técnico',        200, 'Multiplica x1.12 los puntos por controles del balón. El toque perfecto empieza en los pies.',                           'Guantes',  'multiplicador', 1.12, 'Controles', 'Comun'),
('Guantes de Control',        650, 'Multiplica x1.28 los puntos por controles del balón. El esférico nunca se le escapa al portador.',                      'Guantes',  'multiplicador', 1.28, 'Controles', 'Rara'),
('Manos de Seda',            1800, 'Multiplica x1.48 los puntos por controles del balón. Una técnica exquisita para dominar el esférico.',                  'Guantes',  'multiplicador', 1.48, 'Controles', 'Epica'),
('Guantes del Mago',         5000, 'Multiplica x1.75 los puntos por controles del balón. El esférico hace exactamente lo que él desea.',                    'Guantes',  'multiplicador', 1.75, 'Controles', 'Legendaria'),

-- ───────────── CONDUCCIONES PROGRESIVAS (4 objetos) ─────────────
('Zapatillas de Velocidad',   300, 'Multiplica x1.15 los puntos por conducciones progresivas hacia la portería rival.',                                     'Botas',    'multiplicador', 1.15, 'ConduccionesProgresivas', 'Comun'),
('Botines de Sprint',         800, 'Multiplica x1.30 los puntos por conducciones progresivas. Diseñados para el contraataque letal.',                       'Botas',    'multiplicador', 1.30, 'ConduccionesProgresivas', 'Rara'),
('Alas de Mercurio',         2500, 'Multiplica x1.55 los puntos por conducciones progresivas. La velocidad de un dios del olimpo.',                         'Botas',    'multiplicador', 1.55, 'ConduccionesProgresivas', 'Epica'),
('Botas del Viento',         6500, 'Multiplica x1.85 los puntos por conducciones progresivas. Nadie puede seguirle el ritmo en ningún estadio.',            'Botas',    'multiplicador', 1.85, 'ConduccionesProgresivas', 'Legendaria'),

-- ───────────── ACCIONES CREADAS DE TIRO (4 objetos) ─────────────
('Pin Táctico',               250, 'Multiplica x1.12 los puntos por acciones que generan oportunidades de tiro. Pequeño detalle, gran impacto.',            'Cintillo', 'multiplicador', 1.12, 'AccionesCreadasDeTiro', 'Comun'),
('Silbato del Estratega',     700, 'Multiplica x1.28 los puntos por acciones que generan tiros. Genera caos en la defensa rival.',                          'Cintillo', 'multiplicador', 1.28, 'AccionesCreadasDeTiro', 'Rara'),
('El Detonador',             2000, 'Multiplica x1.50 los puntos por acciones que generan tiros. Explosivo en cada jugada ofensiva del partido.',            'Balón',    'multiplicador', 1.50, 'AccionesCreadasDeTiro', 'Epica'),
('La Chispa del Genio',      5500, 'Multiplica x1.78 los puntos por acciones que generan tiros. Improvisa lo que nadie más ve como posible.',               'Capa',     'multiplicador', 1.78, 'AccionesCreadasDeTiro', 'Legendaria'),

-- ───────────── TOQUES (4 objetos) ─────────────
('Mediasuela Técnica',        200, 'Multiplica x1.12 los puntos por toques del balón. El esférico fluye de forma natural por sus pies.',                    'Botas',    'multiplicador', 1.12, 'Toques', 'Comun'),
('Plantilla de Caucho',       600, 'Multiplica x1.25 los puntos por toques del balón. Agarre perfecto en cualquier superficie de juego.',                   'Botas',    'multiplicador', 1.25, 'Toques', 'Rara'),
('Suela de Carbono',         1800, 'Multiplica x1.45 los puntos por toques del balón. Tecnología de última generación al servicio del juego.',              'Botas',    'multiplicador', 1.45, 'Toques', 'Epica'),
('La Suela del Maestro',     5000, 'Multiplica x1.72 los puntos por toques del balón. Cada toque es una obra de arte en movimiento.',                       'Botas',    'multiplicador', 1.72, 'Toques', 'Legendaria'),

-- ───────────── ENTRADAS CON ÉXITO (4 objetos) ─────────────
('Casco Defensivo Básico',    300, 'Multiplica x1.15 los puntos por entradas con éxito. La base de todo buen defensor.',                                    'Armadura', 'multiplicador', 1.15, 'EntradasConExito', 'Comun'),
('Armadura Reforzada',        800, 'Multiplica x1.30 los puntos por entradas con éxito. El defensor perfecto no falla las entradas.',                       'Armadura', 'multiplicador', 1.30, 'EntradasConExito', 'Rara'),
('Armadura de Titán',        2500, 'Multiplica x1.55 los puntos por entradas con éxito. Un defensor de proporciones míticas.',                              'Armadura', 'multiplicador', 1.55, 'EntradasConExito', 'Epica'),
('La Armadura del Guerrero', 6500, 'Multiplica x1.85 los puntos por entradas con éxito. El guerrero que nunca cede ni un centímetro de terreno.',           'Armadura', 'multiplicador', 1.85, 'EntradasConExito', 'Legendaria'),

-- ───────────── ENTRADAS OFENSIVAS (4 objetos) ─────────────
('Coderas del Atacante',      300, 'Multiplica x1.15 los puntos por entradas ofensivas en campo contrario. La presión alta comienza aquí.',                 'Armadura', 'multiplicador', 1.15, 'EntradasOfensivas', 'Comun'),
('Espolones Tácticos',        800, 'Multiplica x1.30 los puntos por entradas ofensivas. La presión alta convertida en arte y destreza.',                    'Botas',    'multiplicador', 1.30, 'EntradasOfensivas', 'Rara'),
('Carga de Élite',           2200, 'Multiplica x1.55 los puntos por entradas ofensivas. La intensidad del pressing moderno en estado puro.',                'Armadura', 'multiplicador', 1.55, 'EntradasOfensivas', 'Epica'),
('Fuerza del Toro',          5500, 'Multiplica x1.85 los puntos por entradas ofensivas. La fuerza bruta al servicio de la táctica más efectiva.',           'Armadura', 'multiplicador', 1.85, 'EntradasOfensivas', 'Legendaria'),

-- ───────────── TIROS DE PENALTI (3 objetos, desde Rara) ─────────────
('El Punto Blanco',          1000, '+3 ptos adicionales por cada penalti marcado. Solo para los más fríos bajo presión extrema.',                           'Balón',    'suma',          3.0,  'TirosPenalti', 'Rara'),
('Ritual del Penalti',       3000, '+5 ptos adicionales por cada penalti marcado. El proceso mental de los grandes especialistas.',                          'Balón',    'suma',          5.0,  'TirosPenalti', 'Epica'),
('Botines del Verdugo',      8000, '+10 ptos adicionales por cada penalti marcado. Los nervios no existen para él. El frío es su hogar.',                   'Botas',    'suma',          10.0, 'TirosPenalti', 'Legendaria'),

-- ───────────── TARJETAS AMARILLAS — reducen penalización (3 objetos) ─────────────
-- ValorEfecto < 1: multiplica la penalización (ej. 0.75 convierte -3 pts en -2.25 pts)
('Cintillo del Fair Play',    900, 'Reduce al 75% la penalización por tarjeta amarilla (-3 pts → -2.25 pts). El juego limpio recompensado.',                 'Cintillo', 'multiplicador', 0.75, 'TarjetasAmarillas', 'Rara'),
('Brazalete Diplomático',    2500, 'Reduce al 50% la penalización por tarjeta amarilla (-3 pts → -1.50 pts). El negociador del campo.',                      'Brazalete','multiplicador', 0.50, 'TarjetasAmarillas', 'Epica'),
('El Escudo de la Inocencia',7000, 'Reduce al 20% la penalización por tarjeta amarilla (-3 pts → -0.60 pts). Casi inmune a las tarjetas.',                   'Escudo',   'multiplicador', 0.20, 'TarjetasAmarillas', 'Legendaria'),

-- ───────────── TARJETAS ROJAS — reducen penalización (2 objetos) ─────────────
-- ValorEfecto < 1: multiplica la penalización (ej. 0.50 convierte -5 pts en -2.50 pts)
('Escudo Jurídico',          4500, 'Reduce al 50% la penalización por tarjeta roja (-5 pts → -2.50 pts). El abogado defensor del campo.',                   'Escudo',   'multiplicador', 0.50, 'TarjetasRojas', 'Epica'),
('Inmunidad Divina',         9500, 'Reduce al 10% la penalización por tarjeta roja (-5 pts → -0.50 pts). Los dioses del fútbol nunca son expulsados.',       'Capa',     'multiplicador', 0.10, 'TarjetasRojas', 'Legendaria');

-- ============================================================
-- Objetos de portero (12 objetos)
-- Temática: guantes, equipación y juego de pies del portero moderno
-- Stats objetivo: Intercepciones, Bloqueos, AccionesCreadasDeTiro
-- ============================================================
INSERT INTO `mydb`.`Objetos`
  (`Nombre`, `Precio`, `Descripcion`, `Tipo`, `Efecto`, `ValorEfecto`, `Estadistica`, `Rareza`)
VALUES

-- ───────────── PORTERO — INTERCEPCIONES (guantes) ─────────────
('Guantes de Portero',        300, 'Multiplica x1.15 los puntos por intercepciones. Las manos del portero siempre en el lugar correcto bajo los palos.',    'Guantes',  'multiplicador', 1.15, 'Intercepciones', 'Comun'),
('Guantes de Reflejos',       800, 'Multiplica x1.30 los puntos por intercepciones. Reacciona ante el peligro antes de que llegue el peligro.',             'Guantes',  'multiplicador', 1.30, 'Intercepciones', 'Rara'),
('Guantes de Élite',         2500, 'Multiplica x1.55 los puntos por intercepciones. Solo los mejores porteros del mundo llevan guantes como estos.',         'Guantes',  'multiplicador', 1.55, 'Intercepciones', 'Epica'),
('Los Guantes de Dios',      7000, 'Multiplica x1.90 los puntos por intercepciones. Legendarios. Infranqueables. Divinos. La portería es una fortaleza.',    'Guantes',  'multiplicador', 1.90, 'Intercepciones', 'Legendaria'),

-- ───────────── PORTERO — BLOQUEOS (equipación) ─────────────
('Casco de Portero',          250, 'Multiplica x1.15 los puntos por bloqueos. La cabeza del portero siempre en el lugar correcto bajo los palos.',           'Armadura', 'multiplicador', 1.15, 'Bloqueos', 'Comun'),
('Equipación del Guardameta', 750, 'Multiplica x1.28 los puntos por bloqueos. Equipación diseñada para maximizar las intervenciones defensivas.',            'Armadura', 'multiplicador', 1.28, 'Bloqueos', 'Rara'),
('El Muro Bajo los Palos',   2200, 'Multiplica x1.50 los puntos por bloqueos. Una presencia imponente que intimida a cualquier delantero rival.',            'Armadura', 'multiplicador', 1.50, 'Bloqueos', 'Epica'),
('El Último Bastión',        6000, 'Multiplica x1.80 los puntos por bloqueos. El portero que nunca se rinde. La última línea de defensa del equipo.',        'Armadura', 'multiplicador', 1.80, 'Bloqueos', 'Legendaria'),

-- ───────────── PORTERO — ACCIONES CREADAS DE TIRO (juego de pies) ─────────────
('Jersey del Portero Activo', 300, 'Multiplica x1.15 los puntos por acciones creadas de tiro. El portero moderno que participa activamente en el juego.',   'Armadura', 'multiplicador', 1.15, 'AccionesCreadasDeTiro', 'Comun'),
('Camiseta del Libero',       800, 'Multiplica x1.30 los puntos por acciones creadas de tiro. El portero que se convierte en jugador de campo adicional.',   'Armadura', 'multiplicador', 1.30, 'AccionesCreadasDeTiro', 'Rara'),
('Jersey del Sweeper-Keeper', 2500,'Multiplica x1.55 los puntos por acciones creadas de tiro. El portero total del fútbol moderno, defiende y construye.',   'Armadura', 'multiplicador', 1.55, 'AccionesCreadasDeTiro', 'Epica'),
('El Portero Legendario',    6500, 'Multiplica x1.85 los puntos por acciones creadas de tiro. La definición del portero moderno: defiende, crea y lidera.', 'Armadura', 'multiplicador', 1.85, 'AccionesCreadasDeTiro', 'Legendaria');


-- Liga general (se crea aquí para que no dependa del primer registro)
INSERT INTO `mydb`.`Ligas` (`Nombre`, `Codigo`, `tipo`) VALUES ('Liga General', NULL, 'general');


-- -----------------------------------------------------
-- Table `mydb`.`Config`
-- Almacena pares clave-valor para configuración global
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Config` (
  `clave` VARCHAR(100) NOT NULL,
  `valor` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE = InnoDB;

-- Fecha simulada inicial (fecha real del sistema)
INSERT INTO `mydb`.`Config` (`clave`, `valor`)
VALUES ('fecha_actual_simulada', NOW());


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
