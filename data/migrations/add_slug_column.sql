-- Migración: añadir columna slug a la tabla Jugador
-- Ejecutar una sola vez en BBDDs existentes.
-- Los slugs de las filas existentes se generan desde Node.js (ver /api/admin/generate-slugs).

ALTER TABLE `mydb`.`Jugador`
  ADD COLUMN `slug` VARCHAR(150) NULL DEFAULT NULL;
