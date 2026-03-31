-- Migración 002: Añadir columnas para el sistema de puntuación y efectos de objetos
-- Ejecutar una sola vez. Si las columnas ya existen, ignorar el error.

-- Puntos calculados por jornada para cada jugador
ALTER TABLE `mydb`.`Estadisticas` ADD COLUMN `Puntos` FLOAT NULL DEFAULT NULL;

-- Multiplicador de puntos que aplica el objeto al jugador equipado
ALTER TABLE `mydb`.`Objetos` ADD COLUMN `ValorEfecto` FLOAT NOT NULL DEFAULT 1.0;

-- Columnas de Liga que pueden no existir si la BD se creó con el schema antiguo
ALTER TABLE `mydb`.`Ligas` ADD COLUMN `Codigo` VARCHAR(100) NULL DEFAULT NULL;
ALTER TABLE `mydb`.`Ligas` ADD COLUMN `tipo` VARCHAR(45) NOT NULL DEFAULT 'privada';

-- Posición del jugador en el slot de la plantilla (0-10)
ALTER TABLE `mydb`.`PlantillaJugadorObjeto` ADD COLUMN `posicionEnPlantilla` INT NOT NULL DEFAULT 0;

-- Tabla de relación Manager-Liga (si se creó con nombre Participaciones en lugar de Manager_Ligas)
-- Ejecutar solo si la tabla Manager_Ligas no existe y existe Participaciones:
-- CREATE TABLE IF NOT EXISTS `mydb`.`Manager_Ligas` (
--   `Manager_idManager` INT NOT NULL,
--   `Ligas_idLigas` INT NOT NULL,
--   PRIMARY KEY (`Manager_idManager`, `Ligas_idLigas`),
--   CONSTRAINT `fk_ML_Manager` FOREIGN KEY (`Manager_idManager`) REFERENCES `mydb`.`Manager` (`idManager`),
--   CONSTRAINT `fk_ML_Ligas` FOREIGN KEY (`Ligas_idLigas`) REFERENCES `mydb`.`Ligas` (`idLigas`)
-- ) ENGINE = InnoDB;
