-- ============================================
-- MIGRACIÓN: Agregar campos de pago a compradores
-- ============================================
-- Ejecutar este script si ya tienes datos en la BD

USE rifa_db;

-- Verificar si el campo 'pagado' ya existe
-- Si no existe, lo agregamos
ALTER TABLE compradores
ADD COLUMN IF NOT EXISTS pagado BOOLEAN DEFAULT FALSE AFTER correo,
ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP NULL AFTER pagado;

-- Agregar índice para búsquedas por estado de pago
ALTER TABLE compradores
ADD INDEX IF NOT EXISTS idx_pagado (pagado);

-- Mostrar la estructura actualizada
DESCRIBE compradores;

-- ============================================
-- Para verificar los datos
-- ============================================
-- SELECT id, nombres, apellidos, pagado, fecha_pago FROM compradores;

-- Para marcar un comprador como pagado:
-- UPDATE compradores SET pagado = TRUE, fecha_pago = NOW() WHERE id = 1;

-- Para ver compradores pagados:
-- SELECT * FROM compradores WHERE pagado = TRUE;

-- Para ver compradores sin pagar:
-- SELECT * FROM compradores WHERE pagado = FALSE;

SELECT 'Migración completada exitosamente' AS mensaje;
