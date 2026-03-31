-- Migration 004: Fix CartaJugador primary key to AUTO_INCREMENT
-- Run this if the table was created without AUTO_INCREMENT on idCartaJugador.
ALTER TABLE `mydb`.`CartaJugador`
    MODIFY COLUMN `idCartaJugador` INT NOT NULL AUTO_INCREMENT;
