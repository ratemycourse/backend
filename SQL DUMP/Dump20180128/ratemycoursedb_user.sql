-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: ratemycoursedb
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `user_id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(64) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (116,'micke','micke@kth.se','asdfasdf'),(117,'jaja','jcarlste@kth.se','123123'),(118,'Kalle','kalle@kth.se','abbaabba'),(119,'johanna','jsjs@kth.se','asdfasdf'),(120,'valle','valle@kth.se','asdfasdf'),(123,'barbara','bar@kth.se','bobbobo'),(124,'vanuda','va@kth.se','asdfasdf'),(125,'asdfasdf','asdfasdf@kth.se','asdfasdf'),(126,'macke','macke@kth.se','password3'),(127,'bobobobo','boasdb@kth.se','asdfasdf'),(128,'asdfaboob','as@kth.se','asdfasdf'),(129,'abcd','b@kth.se','asdfasdf'),(130,'skauningen','hej@kth.se','123123'),(131,'guy','guy@kth.se','123123'),(134,'mickelik','fam@kth.se','123123'),(135,'pukiv2','pukiv2@kth.se','123123'),(136,'Uthreda','elgance@kth.se','Homepage82');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ratemycoursedb`.`user_BEFORE_INSERT` BEFORE INSERT ON `user` FOR EACH ROW
BEGIN
	IF (LENGTH(NEW.name) < 3) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.name) > 45) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_TOO_LONG';
    END IF;

    IF (NEW.email NOT LIKE '%@KTH.se') THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'email_INVALID';
    END IF;
	IF (LENGTH(NEW.email) < 7) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'email_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.password) < 6) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'password_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.password) > 48) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'password_TOO_LONG';
    END IF;
    IF NOT (NEW.name REGEXP '^[A-Za-z0-9]+$') THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_NONE_ALPHANUM';
    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ratemycoursedb`.`user_BEFORE_UPDATE` BEFORE UPDATE ON `user` FOR EACH ROW
BEGIN
	IF (LENGTH(NEW.name) < 3) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.name) > 45) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_TOO_LONG';
    END IF;

    IF (NEW.email NOT LIKE '%@KTH.se') THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'email_INVALID';
    END IF;
	IF (LENGTH(NEW.email) < 7) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'email_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.password) < 6) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'password_TOO_SHORT';
    END IF;
	IF (LENGTH(NEW.password) > 48) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'password_TOO_LONG';
    END IF;
    IF NOT (NEW.name REGEXP '^[A-Za-z0-9]+$') THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'name_NONE_ALPHANUM';
    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-28 19:45:23
