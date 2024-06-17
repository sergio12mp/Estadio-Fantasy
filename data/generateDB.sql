SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Equipo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Equipo` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Equipo` (
  `idEquipo` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(200) NULL,
  PRIMARY KEY (`idEquipo`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Jugador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Jugador` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Jugador` (
  `idJugador` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NULL,
  `Edad` VARCHAR(45) NULL,
  `Pais` VARCHAR(45) NULL,
  `Posicion` VARCHAR(45) NULL,
  `Precio` INT NULL,
  `idEquipo` INT NULL,
  PRIMARY KEY (`idJugador`),
  INDEX `fk_Jugador_Equipo1_idx` (`idEquipo` ASC) VISIBLE,
  INDEX `idx_Jugador_idJugador_idEquipo` (`idJugador`, `idEquipo` ASC) VISIBLE, -- Añadido índice compuesto
  CONSTRAINT `fk_Jugador_Equipo1`
    FOREIGN KEY (`idEquipo`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Temporada`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Temporada` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Temporada` (
  `idTemporada` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(200) NULL,
  PRIMARY KEY (`idTemporada`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Jornada`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Jornada` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Jornada` (
  `idJornada` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NULL,
  `idTemporada` INT NOT NULL,
  PRIMARY KEY (`idJornada`),
  INDEX `fk_Jornada_Temporada1_idx` (`idTemporada` ASC) VISIBLE,
  CONSTRAINT `fk_Jornada_Temporada1`
    FOREIGN KEY (`idTemporada`)
    REFERENCES `mydb`.`Temporada` (`idTemporada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Partido`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Partido` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Partido` (
  `idPartido` INT NOT NULL AUTO_INCREMENT,
  `idJornada` INT NULL,
  `idEquipoLocal` INT NULL,
  `idEquipoVisitante` INT NULL,
  PRIMARY KEY (`idPartido`),
  INDEX `fk_Partido_Jornada1_idx` (`idJornada` ASC) VISIBLE,
  INDEX `fk_Partido_Equipo1_idx` (`idEquipoLocal` ASC) VISIBLE,
  INDEX `fk_Partido_Equipo2_idx` (`idEquipoVisitante` ASC) VISIBLE,
  INDEX `idx_Partido_idPartido_idJornada` (`idPartido`, `idJornada` ASC) VISIBLE, -- Añadido índice compuesto
  CONSTRAINT `fk_Partido_Jornada1`
    FOREIGN KEY (`idJornada`)
    REFERENCES `mydb`.`Jornada` (`idJornada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Partido_Equipo1`
    FOREIGN KEY (`idEquipoLocal`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Partido_Equipo2`
    FOREIGN KEY (`idEquipoVisitante`)
    REFERENCES `mydb`.`Equipo` (`idEquipo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `mydb`.`Estadisticas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Estadisticas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Estadisticas` (
  `idEstadisticas` INT NOT NULL AUTO_INCREMENT,
  `idPartido` INT NULL,
  `idJornada` INT NULL,
  `idJugador` INT NULL,
  `idEquipo` INT NULL,
  `Minutos` INT NULL,
  `Goles` INT NULL,
  `Asistencias` INT NULL,
  `TirosPenalti` INT NULL,
  `TirosPenaltiIntentados` INT NULL,
  `Disparos` INT NULL,
  `DisparosPorteria` INT NULL,
  `TarjetasAmarillas` INT NULL,
  `TarjetasRojas` INT NULL,
  `Toques` INT NULL,
  `Entradas` INT NULL,
  `Intercepciones` INT NULL,
  `Bloqueos` INT NULL,
  `GolesEsperados` FLOAT NULL,
  `GolesEsperadosSinPenaltis` FLOAT NULL,
  `AsistenciasEsperadas` FLOAT NULL,
  `AccionesCreadasDeTiro` INT NULL,
  `AccionesCreadasDeGol` INT NULL,
  `PasesCompletados` INT NULL,
  `PasesIntentados` INT NULL,
  `PorcentajePasesCompletados` FLOAT NULL,
  `PasesProgresivos` INT NULL,
  `Controles` INT NULL,
  `ConduccionesProgresivas` INT NULL,
  `EntradasOfensivas` INT NULL,
  `EntradasConExito` INT NULL,
  PRIMARY KEY (`idEstadisticas`),
  INDEX `fk_Estadisticas_Partido1_idx` (`idPartido`, `idJornada`) VISIBLE,
  INDEX `fk_Estadisticas_Jugador1_idx` (`idJugador`, `idEquipo`) VISIBLE,
  CONSTRAINT `fk_Estadisticas_Partido1`
    FOREIGN KEY (`idPartido`, `idJornada`)
    REFERENCES `mydb`.`Partido` (`idPartido`, `idJornada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Estadisticas_Jugador1`
    FOREIGN KEY (`idJugador`, `idEquipo`)
    REFERENCES `mydb`.`Jugador` (`idJugador`, `idEquipo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Manager`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Manager` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Manager` (
  `idManager` INT NOT NULL,
  PRIMARY KEY (`idManager`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Plantilla`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Plantilla` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Plantilla` (
  `idPlantilla` INT NOT NULL AUTO_INCREMENT,
  `Alineacion` VARCHAR(45) NULL,
  `Puntos` INT NULL,
  `idJornada` INT NULL,
  `idManager` INT NULL,
  PRIMARY KEY (`idPlantilla`),
  INDEX `fk_Plantilla_Jornada1_idx` (`idJornada` ASC) VISIBLE,
  INDEX `fk_Plantilla_Manager1_idx` (`idManager` ASC) VISIBLE,
  CONSTRAINT `fk_Plantilla_Jornada1`
    FOREIGN KEY (`idJornada`)
    REFERENCES `mydb`.`Jornada` (`idJornada`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Plantilla_Manager1`
    FOREIGN KEY (`idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Objetos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Objetos` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Objetos` (
  `idObjetos` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(45) NULL,
  `Precio` INT NULL,
  PRIMARY KEY (`idObjetos`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Ligas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Ligas` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Ligas` (
  `idLigas` INT NOT NULL,
  `Nombre` VARCHAR(45) NULL,
  PRIMARY KEY (`idLigas`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Participaciones`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Participaciones` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Participaciones` (
  `idManager` INT NOT NULL,
  `idLigas` INT NOT NULL,
  PRIMARY KEY (`idManager`, `idLigas`),
  INDEX `fk_Manager_has_Ligas_Ligas1_idx` (`idLigas` ASC) VISIBLE,
  INDEX `fk_Manager_has_Ligas_Manager1_idx` (`idManager` ASC) VISIBLE,
  CONSTRAINT `fk_Manager_has_Ligas_Manager1`
    FOREIGN KEY (`idManager`)
    REFERENCES `mydb`.`Manager` (`idManager`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Manager_has_Ligas_Ligas1`
    FOREIGN KEY (`idLigas`)
    REFERENCES `mydb`.`Ligas` (`idLigas`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`PlantillaJugadorObjeto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`PlantillaJugadorObjeto` ;

CREATE TABLE IF NOT EXISTS `mydb`.`PlantillaJugadorObjeto` (
  `idPlantilla` INT NOT NULL,
  `idJugador` INT NOT NULL,
  `idObjetos` INT NULL,
  INDEX `fk_Plantilla_has_Jugador_Jugador1_idx` (`idJugador` ASC) VISIBLE,
  INDEX `fk_Plantilla_has_Jugador_Plantilla1_idx` (`idPlantilla` ASC) VISIBLE,
  PRIMARY KEY (`idPlantilla`, `idJugador`),
  INDEX `fk_PlantillaJugador_Objetos1_idx` (`idObjetos` ASC) VISIBLE,
  CONSTRAINT `fk_Plantilla_has_Jugador_Plantilla1`
    FOREIGN KEY (`idPlantilla`)
    REFERENCES `mydb`.`Plantilla` (`idPlantilla`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Plantilla_has_Jugador_Jugador1`
    FOREIGN KEY (`idJugador`)
    REFERENCES `mydb`.`Jugador` (`idJugador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_PlantillaJugador_Objetos1`
    FOREIGN KEY (`idObjetos`)
    REFERENCES `mydb`.`Objetos` (`idObjetos`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
