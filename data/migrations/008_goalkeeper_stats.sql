-- ============================================================
-- Migración 008: Columnas de estadísticas de portero
-- Añade Paradas, GolesEncajados, PorteriaACero, PSxGPortero,
-- PenaltisParados a la tabla Estadisticas.
-- ============================================================

ALTER TABLE `mydb`.`Estadisticas`
  ADD COLUMN `Paradas`         INT     NULL DEFAULT NULL AFTER `EntradasConExito`,
  ADD COLUMN `GolesEncajados`  INT     NULL DEFAULT NULL AFTER `Paradas`,
  ADD COLUMN `PorteriaACero`   TINYINT NULL DEFAULT NULL AFTER `GolesEncajados`,
  ADD COLUMN `PSxGPortero`     FLOAT   NULL DEFAULT NULL AFTER `PorteriaACero`,
  ADD COLUMN `PenaltisParados` INT     NULL DEFAULT NULL AFTER `PSxGPortero`;
