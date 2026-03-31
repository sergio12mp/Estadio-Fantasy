-- Migration 003: Club Leagues
-- Adds idEquipo to Ligas (for club-type leagues) and
-- puntuacion_actual to Manager_Ligas (per-league score tracking).

-- 1. Add idEquipo (FK) to Ligas — only populated for club leagues
ALTER TABLE `mydb`.`Ligas`
    ADD COLUMN `idEquipo` INT NULL DEFAULT NULL;

ALTER TABLE `mydb`.`Ligas`
    ADD CONSTRAINT `fk_Ligas_Equipo`
        FOREIGN KEY (`idEquipo`)
        REFERENCES `mydb`.`Equipo` (`idEquipo`)
        ON DELETE SET NULL
        ON UPDATE NO ACTION;

-- 2. Add puntuacion_actual to Manager_Ligas — stores each manager's score within that league
ALTER TABLE `mydb`.`Manager_Ligas`
    ADD COLUMN `puntuacion_actual` FLOAT NOT NULL DEFAULT 0;
