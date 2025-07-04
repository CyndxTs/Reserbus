SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema reserbus
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `reserbus` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `reserbus` ;

-- -----------------------------------------------------
-- Table `TIPO_DE_ASIENTO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TIPO_DE_ASIENTO`;
CREATE TABLE IF NOT EXISTS `TIPO_DE_ASIENTO` (
  `id_tipo_de_asiento` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `descripcion` VARCHAR(120) NULL DEFAULT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_tipo_de_asiento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `EMPRESA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `EMPRESA`;
CREATE TABLE IF NOT EXISTS `EMPRESA` (
  `id_empresa` INT NOT NULL AUTO_INCREMENT,
  `correo_electronico` VARCHAR(120) NOT NULL,
  `contrasenia` VARCHAR(60) NOT NULL,
  `razon_social` VARCHAR(120) NOT NULL,
  `ruc` VARCHAR(11) NOT NULL,
  `descripcion` VARCHAR(200) NULL DEFAULT NULL,
  `logo` MEDIUMBLOB NULL DEFAULT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_empresa`),
  UNIQUE INDEX `correo_electronico_UNIQUE` (`correo_electronico` ASC),
  UNIQUE INDEX `ruc_UNIQUE` (`ruc` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `BUS`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `BUS`;
CREATE TABLE IF NOT EXISTS `BUS` (
  `id_bus` INT NOT NULL AUTO_INCREMENT,
  `placa` VARCHAR(10) NOT NULL,
  `marca` VARCHAR(60) NOT NULL,
  `modelo` VARCHAR(60) NOT NULL,
  `id_empresa` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_bus`),
  INDEX `fk_bus_EMPRESA1_idx` (`id_empresa` ASC),
  CONSTRAINT `fk_bus_EMPRESA1`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `EMPRESA` (`id_empresa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `PISO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PISO`;
CREATE TABLE IF NOT EXISTS `PISO` (
  `id_piso` INT NOT NULL AUTO_INCREMENT,
  `numero_de_piso` INT NOT NULL,
  `nombre` VARCHAR(30) NULL DEFAULT NULL,
  `id_bus` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_piso`),
  INDEX `fk_PISO_BUS1_idx` (`id_bus` ASC),
  CONSTRAINT `fk_PISO_BUS1`
    FOREIGN KEY (`id_bus`)
    REFERENCES `BUS` (`id_bus`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `ASIENTO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ASIENTO`;
CREATE TABLE IF NOT EXISTS `ASIENTO` (
  `id_asiento` INT NOT NULL AUTO_INCREMENT,
  `ubicacion` VARCHAR(4) NOT NULL,
  `tiene_ventana` TINYINT NOT NULL,
  `estado` ENUM('DISPONIBLE', 'RESERVADO') NOT NULL DEFAULT 'DISPONIBLE',
  `id_piso` INT NOT NULL,
  `id_tipo_de_asiento` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_asiento`),
  INDEX `fk_ASIENTO_TIPO_DE_ASIENTO1_idx` (`id_tipo_de_asiento` ASC),
  INDEX `fk_ASIENTO_PISO1_idx` (`id_piso` ASC),
  UNIQUE INDEX `idx_comp_ubicacion_id_piso` (`id_piso` ASC, `ubicacion` ASC),
  CONSTRAINT `fk_ASIENTO_TIPO_DE_ASIENTO1`
    FOREIGN KEY (`id_tipo_de_asiento`)
    REFERENCES `TIPO_DE_ASIENTO` (`id_tipo_de_asiento`),
  CONSTRAINT `fk_ASIENTO_PISO1`
    FOREIGN KEY (`id_piso`)
    REFERENCES `PISO` (`id_piso`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `PAGO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PAGO`;
CREATE TABLE IF NOT EXISTS `PAGO` (
  `id_pago` INT NOT NULL AUTO_INCREMENT,
  `monto` DECIMAL(10,2) NOT NULL,
  `estado` ENUM('PENDIENTE', 'PAGADO', 'RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  `metodo_pago` ENUM('TARJETA', 'TRANSFERENCIA') NOT NULL,
  `moneda` VARCHAR(4) NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pago`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `VIAJERO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `VIAJERO`;
CREATE TABLE IF NOT EXISTS `VIAJERO` (
  `id_viajero` INT NOT NULL AUTO_INCREMENT,
  `correo_electronico` VARCHAR(120) NOT NULL,
  `contrasenia` VARCHAR(60) NOT NULL,
  `nombres` VARCHAR(60) NOT NULL,
  `apellidos` VARCHAR(60) NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `fecha_nacimiento` DATE NULL DEFAULT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_viajero`),
  UNIQUE INDEX `correo_electronico_UNIQUE` (`correo_electronico` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `TERMINAL`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TERMINAL`;
CREATE TABLE IF NOT EXISTS `TERMINAL` (
  `id_terminal` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `pais` VARCHAR(60) NOT NULL,
  `ciudad` VARCHAR(60) NOT NULL,
  `direccion` VARCHAR(200) NOT NULL,
  `latitud` DECIMAL(9,6) NULL,
  `longitud` DECIMAL(9,6) NULL,
  `id_empresa` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_terminal`),
  INDEX `fk_TERMINAL_EMPRESA1_idx` (`id_empresa` ASC),
  CONSTRAINT `fk_TERMINAL_EMPRESA1`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `EMPRESA` (`id_empresa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `RUTA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `RUTA`;
CREATE TABLE IF NOT EXISTS `RUTA` (
  `id_ruta` INT NOT NULL AUTO_INCREMENT,
  `distancia_de_recorrido` DECIMAL(6,2) NOT NULL,
  `id_empresa` INT NOT NULL,
  `id_terminal_origen` INT NOT NULL,
  `id_terminal_destino` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_ruta`),
  INDEX `fk_RUTA_TERMINAL1_idx` (`id_terminal_origen` ASC),
  INDEX `fk_RUTA_TERMINAL2_idx` (`id_terminal_destino` ASC),
  CONSTRAINT `fk_RUTA_TERMINAL1`
    FOREIGN KEY (`id_terminal_origen`)
    REFERENCES `TERMINAL` (`id_terminal`),
  CONSTRAINT `fk_RUTA_TERMINAL2`
    FOREIGN KEY (`id_terminal_destino`)
    REFERENCES `TERMINAL` (`id_terminal`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `VIAJE`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `VIAJE`;
CREATE TABLE IF NOT EXISTS `VIAJE` (
  `id_viaje` INT NOT NULL AUTO_INCREMENT,
  `estado` ENUM('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'RETRASADO', 'CANCELADO') NOT NULL,
  `duracion_estimada_minutos` INT NOT NULL DEFAULT 0,
  `instante_abordaje` DATETIME NOT NULL,
  `instante_partida` DATETIME NULL DEFAULT NULL,
  `instante_llegada` DATETIME NULL DEFAULT NULL,
  `id_ruta` INT NOT NULL,
  `id_bus` INT NOT NULL,
  `id_empresa` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_viaje`),
  INDEX `fk_VIAJE_RUTA1_idx` (`id_ruta` ASC),
  INDEX `fk_VIAJE_BUS1_idx` (`id_bus` ASC),
  INDEX `fk_VIAJE_EMPRESA1_idx` (`id_empresa` ASC),
  CONSTRAINT `fk_VIAJE_RUTA1`
    FOREIGN KEY (`id_ruta`)
    REFERENCES `RUTA` (`id_ruta`),
  CONSTRAINT `fk_VIAJE_BUS1`
    FOREIGN KEY (`id_bus`)
    REFERENCES `BUS` (`id_bus`),
  CONSTRAINT `fk_VIAJE_EMPRESA1`
    FOREIGN KEY (`id_empresa`)
    REFERENCES `EMPRESA` (`id_empresa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `RESERVA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `RESERVA`;
CREATE TABLE IF NOT EXISTS `RESERVA` (
  `id_reserva` INT NOT NULL AUTO_INCREMENT,
  `estado` ENUM('PAGO_PENDIENTE', 'PAGADA', 'COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'PAGO_PENDIENTE',
  `id_viajero` INT NOT NULL,
  `id_viaje_ida` INT NOT NULL,
  `id_viaje_vuelta` INT NULL DEFAULT NULL,
  `id_pago` INT NULL DEFAULT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_reserva`),
  INDEX `fk_RESERVA_VIAJERO1_idx` (`id_viajero` ASC),
  INDEX `fk_RESERVA_VIAJE1_idx` (`id_viaje_ida` ASC),
  INDEX `fk_RESERVA_PAGO1_idx` (`id_pago` ASC),
  INDEX `fk_RESERVA_VIAJE2_idx` (`id_viaje_vuelta` ASC),
  CONSTRAINT `fk_RESERVA_VIAJERO1`
    FOREIGN KEY (`id_viajero`)
    REFERENCES `VIAJERO` (`id_viajero`),
  CONSTRAINT `fk_RESERVA_VIAJE1`
    FOREIGN KEY (`id_viaje_ida`)
    REFERENCES `VIAJE` (`id_viaje`),
  CONSTRAINT `fk_RESERVA_PAGO1`
    FOREIGN KEY (`id_pago`)
    REFERENCES `PAGO` (`id_pago`),
  CONSTRAINT `fk_RESERVA_VIAJE2`
    FOREIGN KEY (`id_viaje_vuelta`)
    REFERENCES `VIAJE` (`id_viaje`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `TARIFA`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TARIFA`;
CREATE TABLE IF NOT EXISTS `TARIFA` (
  `id_tarifa` INT NOT NULL AUTO_INCREMENT,
  `precio` FLOAT NOT NULL,
  `detalle` VARCHAR(100) NULL DEFAULT NULL,
  `id_viaje` INT NOT NULL,
  `id_tipo_de_asiento` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_tarifa`),
  INDEX `fk_TARIFA_VIAJE1_idx` (`id_viaje` ASC),
  INDEX `fk_TARIFA_TIPO_DE_ASIENTO1_idx` (`id_tipo_de_asiento` ASC),
  CONSTRAINT `fk_TARIFA_VIAJE1`
    FOREIGN KEY (`id_viaje`)
    REFERENCES `VIAJE` (`id_viaje`),
  CONSTRAINT `fk_TARIFA_TIPO_DE_ASIENTO1`
    FOREIGN KEY (`id_tipo_de_asiento`)
    REFERENCES `TIPO_DE_ASIENTO` (`id_tipo_de_asiento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `SERVICIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `SERVICIO`;
CREATE TABLE IF NOT EXISTS `SERVICIO` (
  `id_servicio` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(20) NOT NULL,
  `descripcion` VARCHAR(60) NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_servicio`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `BUS_SERVICIO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `BUS_SERVICIO`;
CREATE TABLE IF NOT EXISTS `BUS_SERVICIO` (
  `id_bus` INT NOT NULL,
  `id_servicio` INT NOT NULL,
  PRIMARY KEY (`id_bus`, `id_servicio`),
  INDEX `fk_BUS_has_SERVICIO_BUS1_idx` (`id_bus` ASC),
  INDEX `fk_BUS_has_SERVICIO_SERVICIO1_idx` (`id_servicio` ASC),
  CONSTRAINT `fk_BUS_has_SERVICIO_BUS1`
    FOREIGN KEY (`id_bus`)
    REFERENCES `BUS` (`id_bus`),
  CONSTRAINT `fk_BUS_has_SERVICIO_SERVICIO1`
    FOREIGN KEY (`id_servicio`)
    REFERENCES `SERVICIO` (`id_servicio`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `ADMINISTRADOR`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ADMINISTRADOR`;
CREATE TABLE IF NOT EXISTS `ADMINISTRADOR` (
  `id_administrador` INT NOT NULL AUTO_INCREMENT,
  `correo_electronico` VARCHAR(120) NOT NULL,
  `contrasenia` VARCHAR(60) NOT NULL,
  `nombres` VARCHAR(60) NOT NULL,
  `apellidos` VARCHAR(60) NOT NULL,
  `fecha_nacimiento` DATE NULL DEFAULT NULL,
  `foto` MEDIUMBLOB NULL DEFAULT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_administrador`),
  UNIQUE INDEX `correo_electronico_UNIQUE` (`correo_electronico` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

-- -----------------------------------------------------
-- Table `PASAJERO`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PASAJERO`;
CREATE TABLE IF NOT EXISTS `PASAJERO` (
  `id_pasajero` INT NOT NULL AUTO_INCREMENT,
  `nombres` VARCHAR(60) NOT NULL,
  `apellidos` VARCHAR(60) NOT NULL,
  `tipo_documento` ENUM('DNI', 'PASAPORTE', 'CEDULA', 'CARNET_EXTRANJERIA', 'OTRO') NOT NULL,
  `numero_documento` VARCHAR(30) NOT NULL,
  `correo_electronico` VARCHAR(120) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `id_reserva` INT NOT NULL,
  `id_asiento` INT NOT NULL,
  `id_tarifa` INT NOT NULL,
  `esta_habilitado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pasajero`),
  INDEX `fk_PASAJERO_RESERVA_idx` (`id_reserva` ASC),
  INDEX `fk_PASAJERO_ASIENTO1_idx` (`id_asiento` ASC),
  INDEX `fk_PASAJERO_TARIFA1_idx` (`id_tarifa` ASC),
  CONSTRAINT `fk_PASAJERO_RESERVA`
    FOREIGN KEY (`id_reserva`)
    REFERENCES `RESERVA` (`id_reserva`),
  CONSTRAINT `fk_PASAJERO_ASIENTO1`
    FOREIGN KEY (`id_asiento`)
    REFERENCES `ASIENTO` (`id_asiento`),
  CONSTRAINT `fk_PASAJERO_TARIFA1`
    FOREIGN KEY (`id_tarifa`)
    REFERENCES `TARIFA` (`id_tarifa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;