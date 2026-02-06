-- =============================================
-- CONSULTAS SQL ÚTILES PARA EL SISTEMA DE RIFA
-- =============================================

-- CONSULTAS DE LECTURA
-- =============================================

-- 1. Ver todos los números disponibles
SELECT numero 
FROM numeros 
WHERE vendido = FALSE 
ORDER BY numero;

-- 2. Ver todos los números vendidos
SELECT n.numero, c.nombres, c.apellidos, c.telefono, c.correo, c.fecha_compra
FROM numeros n
INNER JOIN compradores c ON n.id = c.numero_id
WHERE n.vendido = TRUE
ORDER BY n.numero;

-- 3. Ver compradores ordenados por fecha de compra
SELECT * FROM vista_compradores_completa;

-- 4. Ver estadísticas generales
SELECT * FROM vista_estadisticas;

-- 5. Buscar comprador por documento
SELECT * FROM compradores 
WHERE numero_documento = '1234567890';

-- 6. Buscar comprador por nombre
SELECT * FROM compradores 
WHERE nombres LIKE '%Juan%' OR apellidos LIKE '%Pérez%';

-- 7. Ver últimas 10 compras
SELECT * FROM vista_compradores_completa 
ORDER BY fecha_compra DESC 
LIMIT 10;

-- 8. Contar números vendidos por día
SELECT 
    DATE(fecha_compra) as fecha,
    COUNT(*) as ventas
FROM compradores
GROUP BY DATE(fecha_compra)
ORDER BY fecha DESC;

-- 9. Buscar por correo electrónico
SELECT * FROM compradores 
WHERE correo = 'usuario@email.com';

-- 10. Buscar por teléfono
SELECT * FROM compradores 
WHERE telefono = '3001234567';


-- CONSULTAS DE ADMINISTRACIÓN
-- =============================================

-- 11. Ver cuántos números ha comprado una persona (por documento)
SELECT 
    numero_documento,
    nombres,
    apellidos,
    COUNT(*) as cantidad_numeros,
    GROUP_CONCAT(numero ORDER BY numero) as numeros_comprados
FROM vista_compradores_completa
GROUP BY numero_documento, nombres, apellidos;

-- 12. Ver personas que compraron más de un número
SELECT 
    numero_documento,
    nombres,
    apellidos,
    COUNT(*) as cantidad,
    GROUP_CONCAT(numero ORDER BY numero) as numeros
FROM vista_compradores_completa
GROUP BY numero_documento, nombres, apellidos
HAVING COUNT(*) > 1;

-- 13. Ventas por hora del día
SELECT 
    HOUR(fecha_compra) as hora,
    COUNT(*) as ventas
FROM compradores
GROUP BY HOUR(fecha_compra)
ORDER BY hora;

-- 14. Verificar duplicados de email
SELECT correo, COUNT(*) as cantidad
FROM compradores
GROUP BY correo
HAVING COUNT(*) > 1;


-- MANTENIMIENTO Y RESETEO
-- =============================================

-- 15. Resetear toda la rifa (CUIDADO: Borra todas las compras)
DELETE FROM compradores;
UPDATE numeros SET vendido = FALSE;

-- 16. Liberar un número específico (ejemplo: número 25)
DELETE FROM compradores WHERE numero_id = 25;
UPDATE numeros SET vendido = FALSE WHERE id = 25;

-- 17. Eliminar comprador por documento
DELETE FROM compradores WHERE numero_documento = '1234567890';
-- Luego actualizar el estado del número
UPDATE numeros n
LEFT JOIN compradores c ON n.id = c.numero_id
SET n.vendido = FALSE
WHERE c.numero_id IS NULL AND n.vendido = TRUE;

-- 18. Verificar integridad de datos
-- (Números marcados como vendidos pero sin comprador)
SELECT n.numero
FROM numeros n
LEFT JOIN compradores c ON n.id = c.numero_id
WHERE n.vendido = TRUE AND c.id IS NULL;

-- 19. Corregir inconsistencias
UPDATE numeros n
LEFT JOIN compradores c ON n.id = c.numero_id
SET n.vendido = FALSE
WHERE c.id IS NULL;


-- REPORTES Y EXPORTACIÓN
-- =============================================

-- 20. Exportar lista completa de compradores (para Excel)
SELECT 
    n.numero AS 'Número',
    c.numero_documento AS 'Documento',
    c.nombres AS 'Nombres',
    c.apellidos AS 'Apellidos',
    c.telefono AS 'Teléfono',
    c.correo AS 'Correo',
    DATE_FORMAT(c.fecha_compra, '%d/%m/%Y %H:%i') AS 'Fecha Compra'
FROM compradores c
INNER JOIN numeros n ON c.numero_id = n.id
ORDER BY n.numero;

-- 21. Reporte de disponibilidad
SELECT 
    'Total' as Categoría,
    COUNT(*) as Cantidad
FROM numeros
UNION ALL
SELECT 
    'Vendidos',
    COUNT(*)
FROM numeros
WHERE vendido = TRUE
UNION ALL
SELECT 
    'Disponibles',
    COUNT(*)
FROM numeros
WHERE vendido = FALSE;

-- 22. Números consecutivos disponibles
SELECT 
    n1.numero AS inicio,
    COUNT(*) AS consecutivos
FROM numeros n1
INNER JOIN numeros n2 ON n2.numero = n1.numero + 1
WHERE n1.vendido = FALSE AND n2.vendido = FALSE
GROUP BY n1.numero
ORDER BY consecutivos DESC;


-- SORTEOS Y GANADORES
-- =============================================

-- 23. Seleccionar un ganador aleatorio de entre los números vendidos
SELECT 
    n.numero,
    c.nombres,
    c.apellidos,
    c.telefono,
    c.correo
FROM numeros n
INNER JOIN compradores c ON n.id = c.numero_id
WHERE n.vendido = TRUE
ORDER BY RAND()
LIMIT 1;

-- 24. Seleccionar múltiples ganadores (ejemplo: 3 ganadores)
SELECT 
    n.numero,
    c.nombres,
    c.apellidos,
    c.telefono,
    c.correo
FROM numeros n
INNER JOIN compradores c ON n.id = c.numero_id
WHERE n.vendido = TRUE
ORDER BY RAND()
LIMIT 3;


-- BACKUP Y RESPALDO
-- =============================================

-- 25. Crear tabla de respaldo de compradores
CREATE TABLE compradores_backup AS 
SELECT * FROM compradores;

-- 26. Restaurar desde backup
DELETE FROM compradores;
INSERT INTO compradores SELECT * FROM compradores_backup;


-- AUDITORÍA
-- =============================================

-- 27. Crear tabla de auditoría (opcional)
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accion VARCHAR(50),
    tabla VARCHAR(50),
    numero_id INT,
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. Ver log de auditoría
SELECT * FROM auditoria ORDER BY fecha DESC LIMIT 20;


-- NOTA: Recuerda hacer backup regular de tu base de datos
-- Comando desde terminal:
-- mysqldump -u root -p rifa_db > backup_rifa_$(date +%Y%m%d).sql
