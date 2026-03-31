-- ============================================================
-- SETUP SCRIPT: Importar DB real desde Dump20260327
-- En MySQL Workbench: File > Open SQL Script, selecciona este archivo, ejecuta
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_temporada.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_equipo.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_manager.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_objetos.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_config.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_jornada.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_jugador.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_partido.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_estadisticas.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_ligas.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_manager_ligas.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_plantilla.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_cartajugador.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_cartaobjeto.sql;
SOURCE C:/Users/sermo/Documents/tfg/Estadio-Fantasy/dumps/dumps/Dump20260327/mydb_plantillajugadorobjeto.sql;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- MIGRACIÓN: Columnas que el código necesita y no están en el dump
-- ============================================================

ALTER TABLE `manager`
    ADD COLUMN IF NOT EXISTS `pity` INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `puntuacion_actual` INT NOT NULL DEFAULT 0;

ALTER TABLE `estadisticas`
    ADD COLUMN IF NOT EXISTS `Puntos` FLOAT NULL DEFAULT NULL;

ALTER TABLE `objetos`
    ADD COLUMN IF NOT EXISTS `ValorEfecto` FLOAT NOT NULL DEFAULT 1.0;

-- Poblar ValorEfecto desde magnitud para objetos multiplicadores de puntos
UPDATE `objetos`
SET `ValorEfecto` = `magnitud`
WHERE `aumento` = 'multiplicacion'
  AND `estadistica_modificada` = 'Puntos'
  AND `magnitud` IS NOT NULL;

ALTER TABLE `ligas`
    MODIFY COLUMN `tipo` ENUM('general', 'privada', 'club') NOT NULL DEFAULT 'privada';

ALTER TABLE `ligas`
    ADD COLUMN IF NOT EXISTS `idEquipo` INT NULL DEFAULT NULL;

SELECT 'Setup completado correctamente.' AS resultado;
