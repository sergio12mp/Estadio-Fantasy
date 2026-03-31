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
-- Table structure for table `manager_ligas`
--

DROP TABLE IF EXISTS `manager_ligas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager_ligas` (
  `idManager_Ligas` int NOT NULL AUTO_INCREMENT,
  `Manager_idManager` int NOT NULL,
  `Ligas_idLigas` int NOT NULL,
  `puntuacion_actual` int DEFAULT '0',
  PRIMARY KEY (`idManager_Ligas`),
  UNIQUE KEY `unique_manager_liga` (`Manager_idManager`,`Ligas_idLigas`),
  KEY `fk_Manager_Ligas_Ligas1_idx` (`Ligas_idLigas`),
  CONSTRAINT `fk_Manager_Ligas_Ligas1` FOREIGN KEY (`Ligas_idLigas`) REFERENCES `ligas` (`idLigas`) ON DELETE CASCADE,
  CONSTRAINT `fk_Manager_Ligas_Manager1` FOREIGN KEY (`Manager_idManager`) REFERENCES `manager` (`idManager`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager_ligas`
--

LOCK TABLES `manager_ligas` WRITE;
/*!40000 ALTER TABLE `manager_ligas` DISABLE KEYS */;
INSERT INTO `manager_ligas` VALUES (1,1,1,0),(2,2,1,0),(3,3,1,0),(4,1,2,0);
/*!40000 ALTER TABLE `manager_ligas` ENABLE KEYS */;
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
