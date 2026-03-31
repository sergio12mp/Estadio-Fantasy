-- Migración 001: Añadir columna pity a Manager (y oro/balones/puntuacion_actual si no existen)
-- Ejecutar una sola vez. Si las columnas ya existen, ignorar el error.

-- Añadir pity (nueva)
ALTER TABLE `mydb`.`Manager` ADD COLUMN `pity` INT NOT NULL DEFAULT 0;

-- Si oro/balones/puntuacion_actual no existieran aún (ejecutar solo si hacen falta):
-- ALTER TABLE `mydb`.`Manager` ADD COLUMN `oro` INT NOT NULL DEFAULT 0;
-- ALTER TABLE `mydb`.`Manager` ADD COLUMN `balones` INT NOT NULL DEFAULT 0;
-- ALTER TABLE `mydb`.`Manager` ADD COLUMN `puntuacion_actual` INT NOT NULL DEFAULT 0;
