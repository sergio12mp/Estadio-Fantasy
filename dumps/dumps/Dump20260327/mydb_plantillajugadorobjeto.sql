-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `plantillajugadorobjeto`
--

DROP TABLE IF EXISTS `plantillajugadorobjeto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillajugadorobjeto` (
  `idPlantilla` int NOT NULL,
  `idCartaObjeto` int DEFAULT NULL,
  `idCartaJugador` int NOT NULL,
  `posicionEnPlantilla` int NOT NULL DEFAULT '0',
  `idPlantillaJugadorObjeto` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`idPlantillaJugadorObjeto`),
  KEY `idx_PlantillaJugadorObjeto_Plantilla` (`idPlantilla`),
  KEY `idx_PlantillaJugadorObjeto_CartaObjeto` (`idCartaObjeto`),
  KEY `idx_PlantillaJugadorObjeto_CartaJugador` (`idCartaJugador`),
  CONSTRAINT `fk_PlantillaJugadorObjeto_CartaJugador` FOREIGN KEY (`idCartaJugador`) REFERENCES `cartajugador` (`idCartaJugador`),
  CONSTRAINT `fk_PlantillaJugadorObjeto_CartaObjeto` FOREIGN KEY (`idCartaObjeto`) REFERENCES `cartaobjeto` (`idCartaObjeto`),
  CONSTRAINT `fk_PlantillaJugadorObjeto_Plantilla` FOREIGN KEY (`idPlantilla`) REFERENCES `plantilla` (`idPlantilla`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillajugadorobjeto`
--

LOCK TABLES `plantillajugadorobjeto` WRITE;
/*!40000 ALTER TABLE `plantillajugadorobjeto` DISABLE KEYS */;
INSERT INTO `plantillajugadorobjeto` VALUES (1,NULL,16,0,33),(1,NULL,9,1,34),(1,NULL,9,2,35),(1,NULL,9,3,36),(1,NULL,12,4,37),(1,NULL,27,5,38),(1,NULL,29,6,39),(1,NULL,38,7,40),(1,NULL,17,8,41),(1,NULL,13,9,42),(1,NULL,4,10,43),(2,NULL,367,0,54),(2,NULL,12,1,55);
/*!40000 ALTER TABLE `plantillajugadorobjeto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-27 14:15:55
