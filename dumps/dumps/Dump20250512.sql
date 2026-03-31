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
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES ('fecha_actual_simulada','2025-02-12T15:07');
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo`
--

DROP TABLE IF EXISTS `equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipo` (
  `idEquipo` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idEquipo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo`
--

LOCK TABLES `equipo` WRITE;
/*!40000 ALTER TABLE `equipo` DISABLE KEYS */;
INSERT INTO `equipo` VALUES (1,'Osasuna'),(2,'Sevilla'),(3,'Celta Vigo'),(4,'Espanyol'),(5,'Mallorca'),(6,'Real Betis'),(7,'Cádiz'),(8,'Athletic Club'),(9,'Girona');
/*!40000 ALTER TABLE `equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadisticas`
--

DROP TABLE IF EXISTS `estadisticas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadisticas` (
  `idEstadisticas` int NOT NULL AUTO_INCREMENT,
  `idPartido` int DEFAULT NULL,
  `idJornada` int DEFAULT NULL,
  `idJugador` int DEFAULT NULL,
  `idEquipo` int DEFAULT NULL,
  `Minutos` int DEFAULT NULL,
  `Goles` int DEFAULT NULL,
  `Asistencias` int DEFAULT NULL,
  `TirosPenalti` int DEFAULT NULL,
  `TirosPenaltiIntentados` int DEFAULT NULL,
  `Disparos` int DEFAULT NULL,
  `DisparosPorteria` int DEFAULT NULL,
  `TarjetasAmarillas` int DEFAULT NULL,
  `TarjetasRojas` int DEFAULT NULL,
  `Toques` int DEFAULT NULL,
  `Entradas` int DEFAULT NULL,
  `Intercepciones` int DEFAULT NULL,
  `Bloqueos` int DEFAULT NULL,
  `GolesEsperados` float DEFAULT NULL,
  `GolesEsperadosSinPenaltis` float DEFAULT NULL,
  `AsistenciasEsperadas` float DEFAULT NULL,
  `AccionesCreadasDeTiro` int DEFAULT NULL,
  `AccionesCreadasDeGol` int DEFAULT NULL,
  `PasesCompletados` int DEFAULT NULL,
  `PasesIntentados` int DEFAULT NULL,
  `PorcentajePasesCompletados` float DEFAULT NULL,
  `PasesProgresivos` int DEFAULT NULL,
  `Controles` int DEFAULT NULL,
  `ConduccionesProgresivas` int DEFAULT NULL,
  `EntradasOfensivas` int DEFAULT NULL,
  `EntradasConExito` int DEFAULT NULL,
  PRIMARY KEY (`idEstadisticas`),
  KEY `fk_Estadisticas_Partido1_idx` (`idPartido`,`idJornada`),
  KEY `fk_Estadisticas_Jugador1_idx` (`idJugador`,`idEquipo`),
  CONSTRAINT `fk_Estadisticas_Jugador1` FOREIGN KEY (`idJugador`, `idEquipo`) REFERENCES `jugador` (`idJugador`, `idEquipo`),
  CONSTRAINT `fk_Estadisticas_Partido1` FOREIGN KEY (`idPartido`, `idJornada`) REFERENCES `partido` (`idPartido`, `idJornada`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadisticas`
--

LOCK TABLES `estadisticas` WRITE;
/*!40000 ALTER TABLE `estadisticas` DISABLE KEYS */;
INSERT INTO `estadisticas` VALUES (1,1,1,1,1,80,1,0,1,1,0,0,0,0,27,1,1,1,0.8,0,0,6,2,22,22,100,2,19,0,0,0),(2,1,1,2,1,90,0,0,0,0,1,1,0,0,24,2,0,0,0,0,0,2,0,16,20,80,2,11,0,1,0),(3,2,1,3,3,21,0,0,0,0,0,0,0,0,17,1,0,0,0,0,0,0,0,11,12,91.7,0,8,0,1,0),(4,3,2,4,5,4,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,3,4,75,0,4,1,0,0),(5,3,2,5,6,78,2,0,2,2,0,0,0,0,32,0,0,1,1.6,0,0,0,0,19,24,79.2,2,14,0,0,0),(6,4,3,6,8,9,0,0,0,0,1,0,0,0,14,0,0,0,0.1,0.1,0,1,1,11,13,84.6,4,10,1,0,0),(7,4,3,7,8,87,0,0,0,0,0,0,0,0,56,0,0,2,0,0,0.1,2,0,46,50,92,7,41,5,4,3),(8,5,4,8,5,90,1,0,0,0,1,1,0,0,64,2,0,1,0,0,0,1,0,45,52,86.5,2,35,0,0,0),(9,5,4,9,5,90,0,0,0,0,0,0,0,0,45,3,0,0,0,0,0,0,0,39,42,92.9,3,17,1,0,0),(10,6,5,10,4,32,0,0,0,0,0,0,1,0,9,2,0,0,0,0,0,0,0,4,5,80,1,6,1,0,0),(11,6,5,11,4,90,0,0,0,0,3,0,0,0,73,1,2,1,0.1,0.1,0.1,4,1,39,61,63.9,5,44,6,4,1);
/*!40000 ALTER TABLE `estadisticas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jornada`
--

DROP TABLE IF EXISTS `jornada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jornada` (
  `idJornada` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) DEFAULT NULL,
  `idTemporada` int NOT NULL,
  PRIMARY KEY (`idJornada`),
  KEY `fk_Jornada_Temporada1_idx` (`idTemporada`),
  CONSTRAINT `fk_Jornada_Temporada1` FOREIGN KEY (`idTemporada`) REFERENCES `temporada` (`idTemporada`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jornada`
--

LOCK TABLES `jornada` WRITE;
/*!40000 ALTER TABLE `jornada` DISABLE KEYS */;
INSERT INTO `jornada` VALUES (1,'La Liga (Matchweek 1)',1),(2,'La Liga (Matchweek 2)',1),(3,'La Liga (Matchweek 3)',1),(4,'La Liga (Matchweek 4)',1),(5,'La Liga (Matchweek 5)',1);
/*!40000 ALTER TABLE `jornada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jugador`
--

DROP TABLE IF EXISTS `jugador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jugador` (
  `idJugador` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) DEFAULT NULL,
  `Edad` varchar(45) DEFAULT NULL,
  `Pais` varchar(45) DEFAULT NULL,
  `Posicion` varchar(45) DEFAULT NULL,
  `Precio` int DEFAULT NULL,
  `idEquipo` int DEFAULT NULL,
  PRIMARY KEY (`idJugador`),
  KEY `fk_Jugador_Equipo1_idx` (`idEquipo`),
  KEY `idx_Jugador_idJugador_idEquipo` (`idJugador`,`idEquipo`),
  CONSTRAINT `fk_Jugador_Equipo1` FOREIGN KEY (`idEquipo`) REFERENCES `equipo` (`idEquipo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jugador`
--

LOCK TABLES `jugador` WRITE;
/*!40000 ALTER TABLE `jugador` DISABLE KEYS */;
INSERT INTO `jugador` VALUES (1,'Aimar Oroz','20-258','ESP','FW',0,1),(2,'Lucas Torró','28-024','ESP','CM,DM',0,1),(3,'Carles Pérez','24-178','ESP','FW',0,3),(4,'Lago Junior','31-232','CIV','CB',0,5),(5,'Borja Iglesias','29-215','ESP','FW',0,6),(6,'Raúl García','36-049','ESP','RW,FW',0,8),(7,'Oihan Sancet','22-126','ESP','DM',0,8),(8,'Antonio Raillo','30-330','ESP','CB',0,5),(9,'Martin Valjent','26-266','SVK','CB',0,5),(10,'Dani Gómez','24-042','ESP','RM,RW',0,4),(11,'Brian Oliván','28-162','ESP','LB',0,4);
/*!40000 ALTER TABLE `jugador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ligas`
--

DROP TABLE IF EXISTS `ligas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ligas` (
  `idLigas` int NOT NULL,
  `Nombre` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idLigas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ligas`
--

LOCK TABLES `ligas` WRITE;
/*!40000 ALTER TABLE `ligas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ligas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manager`
--

DROP TABLE IF EXISTS `manager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manager` (
  `idManager` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `idGoogle` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `esAdmin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idManager`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manager`
--

LOCK TABLES `manager` WRITE;
/*!40000 ALTER TABLE `manager` DISABLE KEYS */;
INSERT INTO `manager` VALUES (3,'prueba','88nnT2BMbPRT3H71UAWKn7eXbX52','softwaresergiom@gmail.com',1),(4,'Sergio Morejon Perez','qsngVUzi7cdRNLQd7hNkYMa1kot1','sermorepe@uma.es',0);
/*!40000 ALTER TABLE `manager` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `objetos`
--

DROP TABLE IF EXISTS `objetos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `objetos` (
  `idObjetos` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) DEFAULT NULL,
  `Precio` int DEFAULT NULL,
  `Descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idObjetos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objetos`
--

LOCK TABLES `objetos` WRITE;
/*!40000 ALTER TABLE `objetos` DISABLE KEYS */;
/*!40000 ALTER TABLE `objetos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participaciones`
--

DROP TABLE IF EXISTS `participaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participaciones` (
  `idManager` int NOT NULL,
  `idLigas` int NOT NULL,
  PRIMARY KEY (`idManager`,`idLigas`),
  KEY `fk_Manager_has_Ligas_Ligas1_idx` (`idLigas`),
  KEY `fk_Manager_has_Ligas_Manager1_idx` (`idManager`),
  CONSTRAINT `fk_Manager_has_Ligas_Ligas1` FOREIGN KEY (`idLigas`) REFERENCES `ligas` (`idLigas`),
  CONSTRAINT `fk_Manager_has_Ligas_Manager1` FOREIGN KEY (`idManager`) REFERENCES `manager` (`idManager`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participaciones`
--

LOCK TABLES `participaciones` WRITE;
/*!40000 ALTER TABLE `participaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `participaciones` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `fk_Partido_Jornada1_idx` (`idJornada`),
  KEY `fk_Partido_Equipo1_idx` (`idEquipoLocal`),
  KEY `fk_Partido_Equipo2_idx` (`idEquipoVisitante`),
  KEY `idx_Partido_idPartido_idJornada` (`idPartido`,`idJornada`),
  CONSTRAINT `fk_Partido_Equipo1` FOREIGN KEY (`idEquipoLocal`) REFERENCES `equipo` (`idEquipo`),
  CONSTRAINT `fk_Partido_Equipo2` FOREIGN KEY (`idEquipoVisitante`) REFERENCES `equipo` (`idEquipo`),
  CONSTRAINT `fk_Partido_Jornada1` FOREIGN KEY (`idJornada`) REFERENCES `jornada` (`idJornada`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partido`
--

LOCK TABLES `partido` WRITE;
/*!40000 ALTER TABLE `partido` DISABLE KEYS */;
INSERT INTO `partido` VALUES (1,1,1,2),(2,1,3,4),(3,2,5,6),(4,3,7,8),(5,4,5,9),(6,5,4,2);
/*!40000 ALTER TABLE `partido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantilla`
--

DROP TABLE IF EXISTS `plantilla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantilla` (
  `idPlantilla` int NOT NULL AUTO_INCREMENT,
  `Alineacion` varchar(45) DEFAULT NULL,
  `Puntos` int DEFAULT NULL,
  `idJornada` int DEFAULT NULL,
  `idManager` int DEFAULT NULL,
  PRIMARY KEY (`idPlantilla`),
  KEY `fk_Plantilla_Jornada1_idx` (`idJornada`),
  KEY `fk_Plantilla_Manager1_idx` (`idManager`),
  CONSTRAINT `fk_Plantilla_Jornada1` FOREIGN KEY (`idJornada`) REFERENCES `jornada` (`idJornada`),
  CONSTRAINT `fk_Plantilla_Manager1` FOREIGN KEY (`idManager`) REFERENCES `manager` (`idManager`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantilla`
--

LOCK TABLES `plantilla` WRITE;
/*!40000 ALTER TABLE `plantilla` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantilla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillajugadorobjeto`
--

DROP TABLE IF EXISTS `plantillajugadorobjeto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillajugadorobjeto` (
  `idPlantilla` int NOT NULL,
  `idJugador` int NOT NULL,
  `idObjetos` int DEFAULT NULL,
  PRIMARY KEY (`idPlantilla`,`idJugador`),
  KEY `fk_Plantilla_has_Jugador_Jugador1_idx` (`idJugador`),
  KEY `fk_Plantilla_has_Jugador_Plantilla1_idx` (`idPlantilla`),
  KEY `fk_PlantillaJugador_Objetos1_idx` (`idObjetos`),
  CONSTRAINT `fk_Plantilla_has_Jugador_Jugador1` FOREIGN KEY (`idJugador`) REFERENCES `jugador` (`idJugador`),
  CONSTRAINT `fk_Plantilla_has_Jugador_Plantilla1` FOREIGN KEY (`idPlantilla`) REFERENCES `plantilla` (`idPlantilla`),
  CONSTRAINT `fk_PlantillaJugador_Objetos1` FOREIGN KEY (`idObjetos`) REFERENCES `objetos` (`idObjetos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillajugadorobjeto`
--

LOCK TABLES `plantillajugadorobjeto` WRITE;
/*!40000 ALTER TABLE `plantillajugadorobjeto` DISABLE KEYS */;
/*!40000 ALTER TABLE `plantillajugadorobjeto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temporada`
--

DROP TABLE IF EXISTS `temporada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temporada` (
  `idTemporada` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`idTemporada`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temporada`
--

LOCK TABLES `temporada` WRITE;
/*!40000 ALTER TABLE `temporada` DISABLE KEYS */;
INSERT INTO `temporada` VALUES (1,'Temporada 2022-2023');
/*!40000 ALTER TABLE `temporada` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-12 19:08:17
