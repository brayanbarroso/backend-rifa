-- ============================================
-- BASE DE DATOS PARA SISTEMA DE RIFA
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS rifa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rifa_db;

-- ============================================
-- Tabla: numeros
-- Almacena los 100 números de la rifa (00-99)
-- ============================================
CREATE TABLE IF NOT EXISTS numeros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    vendido BOOLEAN DEFAULT FALSE,
    INDEX idx_vendido (vendido),
    INDEX idx_numero (numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: compradores
-- Almacena los datos de las personas que compran números
-- ============================================
CREATE TABLE IF NOT EXISTS compradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_id INT NOT NULL,
    numero_documento VARCHAR(50) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP NULL,
    
    -- Llave foránea
    FOREIGN KEY (numero_id) REFERENCES numeros(id) ON DELETE CASCADE,
    
    -- Índices para búsquedas rápidas
    INDEX idx_numero_id (numero_id),
    INDEX idx_documento (numero_documento),
    INDEX idx_fecha (fecha_compra),
    INDEX idx_pagado (pagado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: users
-- Almacena los datos de los usuarios del sistema
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabla: sessions
-- Almacena las sesiones de los usuarios
-- ============================================
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Tabla: config_rifa
-- Almacena la configuración dinámica de la rifa
-- ============================================
CREATE TABLE IF NOT EXISTS config_rifa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_rifa DATE NOT NULL,
    loteria VARCHAR(100) NOT NULL,
    valor_rifa DECIMAL(10, 2) NOT NULL,
    premio DECIMAL(15, 2) NOT NULL,
    medio_pago VARCHAR(100) NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_actualizado (actualizado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertar configuración inicial de la rifa
-- ============================================
INSERT INTO config_rifa (fecha_rifa, loteria, valor_rifa, premio, medio_pago, responsable) 
VALUES ('2026-02-27', 'Sinuano Noche', 15000.00, 500000.00, 'Efectivo, Nequi o Llave', 'Brian');

-- ============================================
-- Insertar los 100 números iniciales (00-99)
-- ============================================
INSERT INTO numeros (numero, vendido) VALUES
(0, FALSE), (1, FALSE), (2, FALSE), (3, FALSE), (4, FALSE),
(5, FALSE), (6, FALSE), (7, FALSE), (8, FALSE), (9, FALSE),
(10, FALSE), (11, FALSE), (12, FALSE), (13, FALSE), (14, FALSE),
(15, FALSE), (16, FALSE), (17, FALSE), (18, FALSE), (19, FALSE),
(20, FALSE), (21, FALSE), (22, FALSE), (23, FALSE), (24, FALSE),
(25, FALSE), (26, FALSE), (27, FALSE), (28, FALSE), (29, FALSE),
(30, FALSE), (31, FALSE), (32, FALSE), (33, FALSE), (34, FALSE),
(35, FALSE), (36, FALSE), (37, FALSE), (38, FALSE), (39, FALSE),
(40, FALSE), (41, FALSE), (42, FALSE), (43, FALSE), (44, FALSE),
(45, FALSE), (46, FALSE), (47, FALSE), (48, FALSE), (49, FALSE),
(50, FALSE), (51, FALSE), (52, FALSE), (53, FALSE), (54, FALSE),
(55, FALSE), (56, FALSE), (57, FALSE), (58, FALSE), (59, FALSE),
(60, FALSE), (61, FALSE), (62, FALSE), (63, FALSE), (64, FALSE),
(65, FALSE), (66, FALSE), (67, FALSE), (68, FALSE), (69, FALSE),
(70, FALSE), (71, FALSE), (72, FALSE), (73, FALSE), (74, FALSE),
(75, FALSE), (76, FALSE), (77, FALSE), (78, FALSE), (79, FALSE),
(80, FALSE), (81, FALSE), (82, FALSE), (83, FALSE), (84, FALSE),
(85, FALSE), (86, FALSE), (87, FALSE), (88, FALSE), (89, FALSE),
(90, FALSE), (91, FALSE), (92, FALSE), (93, FALSE), (94, FALSE),
(95, FALSE), (96, FALSE), (97, FALSE), (98, FALSE), (99, FALSE);

-- ============================================
-- Vista: vista_compradores_completa
-- Muestra información completa de compradores con su número
-- ============================================
CREATE OR REPLACE VIEW vista_compradores_completa AS
SELECT 
    c.id AS comprador_id,
    n.numero AS numero_comprado,
    c.numero_documento,
    c.nombres,
    c.apellidos,
    c.telefono,
    c.correo,
    c.fecha_compra
FROM compradores c
INNER JOIN numeros n ON c.numero_id = n.id
ORDER BY c.fecha_compra DESC;

-- ============================================
-- Vista: vista_estadisticas
-- Muestra estadísticas generales de la rifa
-- ============================================
CREATE OR REPLACE VIEW vista_estadisticas AS
SELECT 
    COUNT(*) AS total_numeros,
    SUM(CASE WHEN vendido = TRUE THEN 1 ELSE 0 END) AS numeros_vendidos,
    SUM(CASE WHEN vendido = FALSE THEN 1 ELSE 0 END) AS numeros_disponibles,
    ROUND((SUM(CASE WHEN vendido = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS porcentaje_vendido
FROM numeros;

-- ============================================
-- Consultas útiles de ejemplo
-- ============================================

-- Ver todos los números disponibles
-- SELECT numero FROM numeros WHERE vendido = FALSE ORDER BY numero;

-- Ver todos los números vendidos con información del comprador
-- SELECT * FROM vista_compradores_completa;

-- Ver estadísticas generales
-- SELECT * FROM vista_estadisticas;

-- Buscar comprador por documento
-- SELECT * FROM compradores WHERE numero_documento = 'DOCUMENTO_AQUI';

-- Ver últimas 10 compras
-- SELECT * FROM vista_compradores_completa LIMIT 10;

-- ============================================
-- Información de la base de datos creada
-- ============================================
SELECT 'Base de datos creada exitosamente!' AS mensaje;
SELECT COUNT(*) AS total_numeros FROM numeros;
SELECT 'Tablas: numeros, compradores' AS tablas_creadas;
SELECT 'Vistas: vista_compradores_completa, vista_estadisticas' AS vistas_creadas;
