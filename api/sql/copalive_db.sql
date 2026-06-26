-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: copalive_db
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '50d17b74-b469-11f0-b954-14cb196a05bb:1-2985';

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bandera_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_iso` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (1,'México','https://www.bing.com/th/id/OIP._J3Q4kCEC1Qc6J6Mb1nRlgHaEO?w=536&h=270&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2',NULL);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partidos`
--

DROP TABLE IF EXISTS `partidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `torneo_id` int NOT NULL,
  `equipo_local_id` int NOT NULL,
  `equipo_visitante_id` int NOT NULL,
  `goles_local` int DEFAULT NULL,
  `goles_visitante` int DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `fase` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('programado','en_juego','terminado') COLLATE utf8mb4_unicode_ci DEFAULT 'programado',
  PRIMARY KEY (`id`),
  KEY `torneo_id` (`torneo_id`),
  KEY `equipo_local_id` (`equipo_local_id`),
  KEY `equipo_visitante_id` (`equipo_visitante_id`),
  CONSTRAINT `partidos_ibfk_1` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `partidos_ibfk_2` FOREIGN KEY (`equipo_local_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `partidos_ibfk_3` FOREIGN KEY (`equipo_visitante_id`) REFERENCES `equipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partidos`
--

LOCK TABLES `partidos` WRITE;
/*!40000 ALTER TABLE `partidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `partidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torneo_equipos`
--

DROP TABLE IF EXISTS `torneo_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneo_equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `torneo_id` int NOT NULL,
  `equipo_id` int NOT NULL,
  `grupo` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `torneo_id` (`torneo_id`,`equipo_id`),
  KEY `equipo_id` (`equipo_id`),
  CONSTRAINT `torneo_equipos_ibfk_1` FOREIGN KEY (`torneo_id`) REFERENCES `torneos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `torneo_equipos_ibfk_2` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneo_equipos`
--

LOCK TABLES `torneo_equipos` WRITE;
/*!40000 ALTER TABLE `torneo_equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `torneo_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `torneos`
--

DROP TABLE IF EXISTS `torneos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `torneos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `año` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('selecciones','clubes') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('proximo','en_curso','finalizado') COLLATE utf8mb4_unicode_ci DEFAULT 'proximo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `torneos`
--

LOCK TABLES `torneos` WRITE;
/*!40000 ALTER TABLE `torneos` DISABLE KEYS */;
INSERT INTO `torneos` VALUES (3,'Copa Mundial de la FIFA 2026™','2026','selecciones','proximo');
/*!40000 ALTER TABLE `torneos` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-25 18:52:07
