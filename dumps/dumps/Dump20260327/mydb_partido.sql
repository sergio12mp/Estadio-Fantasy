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
-- Table structure for table `partido`
--

DROP TABLE IF EXISTS `partido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partido` (
  `idPartido` int NOT NULL AUTO_INCREMENT,
  `idJornada` int DEFAULT NULL,
  `idEquipoLocal` int DEFAULT NULL,
  `idEquipoVisitante` int DEFAULT NULL,
  PRIMARY KEY (`idPartido`),
  UNIQUE KEY `uq_Partido_idPartido_idJornada` (`idPartido`,`idJornada`),
  KEY `idx_Partido_idJornada` (`idJornada`),
  KEY `idx_Partido_idEquipoLocal` (`idEquipoLocal`),
  KEY `idx_Partido_idEquipoVisitante` (`idEquipoVisitante`),
  CONSTRAINT `fk_Partido_EquipoLocal` FOREIGN KEY (`idEquipoLocal`) REFERENCES `equipo` (`idEquipo`),
  CONSTRAINT `fk_Partido_EquipoVisitante` FOREIGN KEY (`idEquipoVisitante`) REFERENCES `equipo` (`idEquipo`),
  CONSTRAINT `fk_Partido_Jornada` FOREIGN KEY (`idJornada`) REFERENCES `jornada` (`idJornada`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partido`
--

LOCK TABLES `partido` WRITE;
/*!40000 ALTER TABLE `partido` DISABLE KEYS */;
INSERT INTO `partido` VALUES (1,1,1,2),(2,1,3,4),(3,1,5,6),(4,1,7,8),(5,1,9,10),(6,1,11,12),(7,1,13,14),(8,1,15,16),(9,1,17,18),(10,1,19,20),(11,2,4,8),(12,2,2,5),(13,2,1,9),(14,2,16,19),(15,2,3,14),(16,2,15,11),(17,2,18,6),(18,2,10,7),(19,2,20,13),(20,2,12,17),(21,3,12,3),(22,3,19,1),(23,3,20,10),(24,3,8,16),(25,3,13,2),(26,3,17,6),(27,3,7,5),(28,3,4,14),(29,3,9,15),(30,3,11,18),(31,4,3,9),(32,4,16,12),(33,4,14,19),(34,4,10,18),(35,4,2,7),(36,4,1,8),(37,4,15,4),(38,4,6,20),(39,4,11,17),(40,4,5,13),(41,5,12,5),(42,5,8,11),(43,5,4,2),(44,5,9,7),(45,5,18,3),(46,5,14,16),(47,5,20,15),(48,5,17,10),(49,5,19,6),(50,5,13,1);
/*!40000 ALTER TABLE `partido` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-27 14:15:57
