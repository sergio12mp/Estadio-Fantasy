-- ============================================================
-- Migración 007 — Crear tabla Config
-- Necesaria para el control de tiempo simulado del dashboard
-- ============================================================

USE `mydb`;

CREATE TABLE IF NOT EXISTS `Config` (
  `clave` VARCHAR(100) NOT NULL,
  `valor` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`clave`)
) ENGINE = InnoDB;

INSERT IGNORE INTO `Config` (`clave`, `valor`)
VALUES ('fecha_actual_simulada', NOW());
