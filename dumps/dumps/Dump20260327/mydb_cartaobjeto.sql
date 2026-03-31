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
-- Table structure for table `cartaobjeto`
--

DROP TABLE IF EXISTS `cartaobjeto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartaobjeto` (
  `idCartaObjeto` int NOT NULL AUTO_INCREMENT,
  `idObjetos` int NOT NULL,
  `idManager` int NOT NULL,
  `Rareza` varchar(45) NOT NULL,
  PRIMARY KEY (`idCartaObjeto`),
  UNIQUE KEY `idCartaObjeto_UNIQUE` (`idCartaObjeto`),
  KEY `idx_CartaObjeto_idObjetos` (`idObjetos`),
  KEY `idx_CartaObjeto_idManager` (`idManager`),
  CONSTRAINT `fk_CartaObjeto_Manager` FOREIGN KEY (`idManager`) REFERENCES `manager` (`idManager`),
  CONSTRAINT `fk_CartaObjeto_Objetos` FOREIGN KEY (`idObjetos`) REFERENCES `objetos` (`idObjetos`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartaobjeto`
--

LOCK TABLES `cartaobjeto` WRITE;
/*!40000 ALTER TABLE `cartaobjeto` DISABLE KEYS */;
INSERT INTO `cartaobjeto` VALUES (1,5,1,'Dummy'),(2,5,1,'Dummy'),(3,1,1,'Común'),(4,2,1,'Raro'),(5,3,1,'Épico'),(6,4,1,'Legendario');
/*!40000 ALTER TABLE `cartaobjeto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-27 14:15:56
