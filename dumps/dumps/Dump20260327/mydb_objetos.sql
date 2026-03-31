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
  `aumento` varchar(20) DEFAULT NULL,
  `estadistica_modificada` varchar(50) DEFAULT NULL,
  `magnitud` decimal(5,2) DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `rareza` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`idObjetos`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `objetos`
--

LOCK TABLES `objetos` WRITE;
/*!40000 ALTER TABLE `objetos` DISABLE KEYS */;
INSERT INTO `objetos` VALUES (1,'Bota',0,'Suma 1 punto extra por cada gol anotado por un jugador',NULL,NULL,NULL,NULL,NULL),(2,'Bota de Bronce',1,'Suma 2 puntos extra por cada gol anotado por un jugador',NULL,NULL,NULL,NULL,NULL),(3,'Bota de Plata',2,'Suma 3.5 puntos extra por cada gol anotado por un jugador',NULL,NULL,NULL,NULL,NULL),(4,'Bota de Oro',3,'Suma 5 puntos extra por cada gol anotado por un jugador',NULL,NULL,NULL,NULL,NULL),(5,'Slot Vacío',0,'Representa un slot de objeto no utilizado.',NULL,NULL,NULL,NULL,NULL),(6,'Capitán',1,'Multiplica los puntos base del jugador por 2.','multiplicacion','puntos_base',2.00,1,'Común'),(67,'Capitán',1,'Multiplica los puntos base del jugador por 2.','multiplicacion','Puntos',2.00,1,'Común'),(68,'Superbota',1,'Otorga 2 puntos extra por cada gol.','suma','Goles',2.00,1,'Raro'),(69,'Superbota',2,'Otorga 3 puntos extra por cada gol.','suma','Goles',3.00,1,'Épico'),(70,'Superbota',3,'Otorga 4 puntos extra por cada gol.','suma','Goles',4.00,1,'Legendario'),(71,'Balón de Oro',1,'Multiplica los puntos base por 1.15.','multiplicacion','Puntos',1.15,1,'Raro'),(72,'Balón de Oro',2,'Multiplica los puntos base por 1.3.','multiplicacion','Puntos',1.30,1,'Épico'),(73,'Balón de Oro',3,'Multiplica los puntos base por 1.5.','multiplicacion','Puntos',1.50,1,'Legendario'),(74,'Guante de Seda',1,'Otorga 3 puntos extra por cada asistencia.','suma','Asistencias',3.00,1,'Raro'),(75,'Guante de Seda',2,'Otorga 4 puntos extra por cada asistencia.','suma','Asistencias',4.00,1,'Épico'),(76,'Guante de Seda',3,'Otorga 5 puntos extra por cada asistencia.','suma','Asistencias',5.00,1,'Legendario'),(77,'Creador de Juego',1,'Otorga 1 punto por cada 10% de asistencias sobre goles.','suma','relacion_Asistencias_Goles',1.00,10,'Raro'),(78,'Creador de Juego',2,'Otorga 2 puntos por cada 10% de asistencias sobre goles.','suma','relacion_Asistencias_Goles',2.00,10,'Épico'),(79,'Creador de Juego',3,'Otorga 3 puntos por cada 10% de asistencias sobre goles.','suma','relacion_Asistencias_Goles',3.00,10,'Legendario'),(80,'Francotirador',1,'Otorga 1 punto extra por cada tiro a puerta.','suma','DisparosPorteria',1.00,1,'Raro'),(81,'Francotirador',2,'Otorga 2 puntos extra por cada tiro a puerta.','suma','DisparosPorteria',2.00,1,'Épico'),(82,'Francotirador',3,'Otorga 3 puntos extra por cada tiro a puerta.','suma','DisparosPorteria',3.00,1,'Legendario'),(83,'Cañón',1,'Multiplica los puntos por 1.1 si el jugador hace 5+ tiros a puerta.','multiplicacion','Puntos',1.10,5,'Raro'),(84,'Cañón',2,'Multiplica los puntos por 1.2 si el jugador hace 5+ tiros a puerta.','multiplicacion','Puntos',1.20,5,'Épico'),(85,'Cañón',3,'Multiplica los puntos por 1.3 si el jugador hace 5+ tiros a puerta.','multiplicacion','Puntos',1.30,5,'Legendario'),(86,'Brújula',1,'Otorga 5 puntos si el jugador tiene >85% de pases completados.','suma','PorcentajePasesCompletados',5.00,85,'Raro'),(87,'Brújula',2,'Otorga 10 puntos si el jugador tiene >90% de pases completados.','suma','PorcentajePasesCompletados',10.00,90,'Épico'),(88,'Brújula',3,'Otorga 15 puntos si el jugador tiene >95% de pases completados.','suma','PorcentajePasesCompletados',15.00,95,'Legendario'),(89,'Conductor de Orquesta',1,'Multiplica los puntos por 1.1 si el jugador tiene >80% de pases completados.','multiplicacion','Puntos',1.10,80,'Raro'),(90,'Conductor de Orquesta',2,'Multiplica los puntos por 1.2 si el jugador tiene >85% de pases completados.','multiplicacion','Puntos',1.20,85,'Épico'),(91,'Conductor de Orquesta',3,'Multiplica los puntos por 1.3 si el jugador tiene >90% de pases completados.','multiplicacion','Puntos',1.30,90,'Legendario'),(92,'Muro',1,'Otorga 1 punto extra por cada 2 balones recuperados.','suma','Entradas',1.00,2,'Raro'),(93,'Muro',2,'Otorga 2 puntos extra por cada 2 balones recuperados.','suma','Entradas',2.00,2,'Épico'),(94,'Muro',3,'Otorga 3 puntos extra por cada 2 balones recuperados.','suma','Entradas',3.00,2,'Legendario'),(95,'Perro de Presa',1,'Multiplica los puntos por 1.1 si el jugador recupera más de 10 balones.','multiplicacion','Puntos',1.10,10,'Raro'),(96,'Perro de Presa',2,'Multiplica los puntos por 1.2 si el jugador recupera más de 15 balones.','multiplicacion','Puntos',1.20,15,'Épico'),(97,'Perro de Presa',3,'Multiplica los puntos por 1.3 si el jugador recupera más de 20 balones.','multiplicacion','Puntos',1.30,20,'Legendario'),(98,'Escudo',1,'Otorga 1 punto extra por cada falta recibida.','suma','FaltasRecibidas',1.00,1,'Raro'),(99,'Escudo',2,'Otorga 2 puntos extra por cada falta recibida.','suma','FaltasRecibidas',2.00,1,'Épico'),(100,'Escudo',3,'Otorga 3 puntos extra por cada falta recibida.','suma','FaltasRecibidas',3.00,1,'Legendario'),(101,'Imán',1,'Multiplica los puntos por 1.1 si el jugador recibe más de 3 faltas.','multiplicacion','Puntos',1.10,3,'Raro'),(102,'Imán',2,'Multiplica los puntos por 1.2 si el jugador recibe más de 5 faltas.','multiplicacion','Puntos',1.20,5,'Épico'),(103,'Imán',3,'Multiplica los puntos por 1.3 si el jugador recibe más de 7 faltas.','multiplicacion','Puntos',1.30,7,'Legendario'),(104,'Capa Fair Play',1,'Otorga 5 puntos si el jugador comete menos de 3 faltas.','suma','FaltasCometidas',5.00,3,'Raro'),(105,'Capa Fair Play',2,'Otorga 10 puntos si el jugador comete menos de 2 faltas.','suma','FaltasCometidas',10.00,2,'Épico'),(106,'Capa Fair Play',3,'Otorga 15 puntos si el jugador comete 0 faltas.','suma','FaltasCometidas',15.00,1,'Legendario'),(107,'Gentilhombre',1,'Multiplica los puntos por 1.1 si el jugador no comete faltas.','multiplicacion','Puntos',1.10,0,'Raro'),(108,'Gentilhombre',2,'Multiplica los puntos por 1.2 si el jugador no comete faltas.','multiplicacion','Puntos',1.20,0,'Épico'),(109,'Gentilhombre',3,'Multiplica los puntos por 1.3 si el jugador no comete faltas.','multiplicacion','Puntos',1.30,0,'Legendario'),(110,'Pase Limpio',1,'Otorga 5 puntos si el jugador no recibe tarjetas.','suma','TarjetasAmarillas',5.00,0,'Raro'),(111,'Pase Limpio',2,'Otorga 10 puntos si el jugador no recibe tarjetas.','suma','TarjetasAmarillas',10.00,0,'Épico'),(112,'Pase Limpio',3,'Otorga 15 puntos si el jugador no recibe tarjetas.','suma','TarjetasAmarillas',15.00,0,'Legendario'),(113,'Tarjeta Inmune',1,'Reduce la penalización de tarjeta amarilla en 10%.','multiplicacion','TarjetasAmarillas',0.90,1,'Raro'),(114,'Tarjeta Inmune',2,'Reduce la penalización de tarjeta amarilla en 20%.','multiplicacion','TarjetasAmarillas',0.80,1,'Épico'),(115,'Tarjeta Inmune',3,'Reduce la penalización de tarjeta amarilla en 30%.','multiplicacion','TarjetasAmarillas',0.70,1,'Legendario'),(116,'Guante de Oro',1,'Otorga 5 puntos extra por portería a cero.','suma','porteria_a_cero',5.00,1,'Raro'),(117,'Guante de Oro',2,'Otorga 10 puntos extra por portería a cero.','suma','porteria_a_cero',10.00,1,'Épico'),(118,'Guante de Oro',3,'Otorga 15 puntos extra por portería a cero.','suma','porteria_a_cero',15.00,1,'Legendario'),(119,'Cerrojo',1,'Multiplica los puntos por 1.1 si el portero no encaja goles.','multiplicacion','Puntos',1.10,1,'Raro'),(120,'Cerrojo',2,'Multiplica los puntos por 1.2 si el portero no encaja goles.','multiplicacion','Puntos',1.20,1,'Épico'),(121,'Cerrojo',3,'Multiplica los puntos por 1.3 si el portero no encaja goles.','multiplicacion','Puntos',1.30,1,'Legendario'),(122,'Araña',1,'Otorga 1 punto extra por cada 2 paradas.','suma','Paradas',1.00,2,'Raro'),(123,'Araña',2,'Otorga 2 puntos extra por cada 2 paradas.','suma','Paradas',2.00,2,'Épico'),(124,'Araña',3,'Otorga 3 puntos extra por cada 2 paradas.','suma','Paradas',3.00,2,'Legendario'),(125,'Reflejos de Gato',1,'Multiplica los puntos base por 1.1 por hacer más de 5 paradas.','multiplicacion','Puntos',1.10,5,'Raro'),(126,'Reflejos de Gato',2,'Multiplica los puntos base por 1.2 por hacer más de 8 paradas.','multiplicacion','Puntos',1.20,8,'Épico'),(127,'Reflejos de Gato',3,'Multiplica los puntos base por 1.3 por hacer más de 10 paradas.','multiplicacion','Puntos',1.30,10,'Legendario');
/*!40000 ALTER TABLE `objetos` ENABLE KEYS */;
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
