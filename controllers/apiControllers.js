// Obtener todos los números
import { getPool } from "../config/db.js";

const getNumbers = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
            SELECT n.id, n.numero, n.vendido, 
                   c.numero_documento, c.nombres, c.apellidos, 
                   c.telefono, c.correo, c.pagado, c.fecha_compra, c.fecha_pago
            FROM numeros n
            LEFT JOIN compradores c ON n.id = c.numero_id
            ORDER BY n.numero
        `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener números:", error);
    res.status(500).json({ error: "Error al obtener los números" });
  }
};

// Obtener un número específico
const getNumberById = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `
            SELECT n.id, n.numero, n.vendido, 
                   c.numero_documento, c.nombres, c.apellidos, 
                   c.telefono, c.correo, c.pagado, c.fecha_compra, c.fecha_pago
            FROM numeros n
            LEFT JOIN compradores c ON n.id = c.numero_id
            WHERE n.id = ?
        `,
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Número no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener número:", error);
    res.status(500).json({ error: "Error al obtener el número" });
  }
};

// Comprar un número
const purchaseNumber = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { numero_documento, nombres, apellidos, telefono, correo } = req.body;
    const numeroId = req.params.id;

    if (!numero_documento || !nombres || !apellidos || !telefono || !correo) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const [numero] = await connection.query(
      "SELECT vendido FROM numeros WHERE id = ?",
      [numeroId],
    );

    if (numero.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Número no encontrado" });
    }

    if (numero[0].vendido) {
      await connection.rollback();
      return res.status(400).json({ error: "Este número ya fue vendido" });
    }

    const [result] = await connection.query(
      `INSERT INTO compradores (numero_id, numero_documento, nombres, apellidos, telefono, correo)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [numeroId, numero_documento, nombres, apellidos, telefono, correo],
    );

    await connection.query("UPDATE numeros SET vendido = true WHERE id = ?", [
      numeroId,
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: "Número comprado exitosamente",
      compradorId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al procesar compra:", error);
    res.status(500).json({ error: "Error al procesar la compra" });
  } finally {
    connection.release();
  }
};

// Obtener estadísticas
const getStats = async (req, res) => {
  try {
    const pool = getPool();
    const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN vendido = true THEN 1 ELSE 0 END) as vendidos,
                SUM(CASE WHEN vendido = false THEN 1 ELSE 0 END) as disponibles
            FROM numeros
        `);

    res.json(stats[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

// Obtener todos los compradores
const getBuyers = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
            SELECT c.id, c.numero_id, c.numero_documento, c.nombres, c.apellidos,
                   c.telefono, c.correo, c.pagado, c.fecha_compra, c.fecha_pago, n.numero
            FROM compradores c
            INNER JOIN numeros n ON c.numero_id = n.id
            ORDER BY c.fecha_compra DESC
        `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener compradores:", error);
    res.status(500).json({ error: "Error al obtener compradores" });
  }
};

// Marcar comprador como pagado
const markAsPaid = async (req, res) => {
  try {
    const pool = getPool();
    const { compradorId } = req.params;
    const { pagado } = req.body;

    if (compradorId === undefined) {
      return res.status(400).json({ error: "ID del comprador es requerido" });
    }

    // Verificar que el comprador existe
    const [comprador] = await pool.query(
      "SELECT id, pagado, fecha_pago FROM compradores WHERE id = ?",
      [compradorId],
    );

    if (comprador.length === 0) {
      return res.status(404).json({ error: "Comprador no encontrado" });
    }

    // Actualizar el estado de pago
    const fecha_pago = pagado === true ? new Date() : null;
    await pool.query(
      "UPDATE compradores SET pagado = ?, fecha_pago = ? WHERE id = ?",
      [pagado === true, fecha_pago, compradorId],
    );

    res.json({
      success: true,
      message:
        pagado === true ? "Comprador marcado como pagado" : "Pago removido",
      compradorId,
      pagado: pagado === true,
      fecha_pago,
    });
  } catch (error) {
    console.error("Error al actualizar estado de pago:", error);
    res.status(500).json({ error: "Error al actualizar estado de pago" });
  }
};

// Obtener estadísticas de pagos
const getPaymentStats = async (req, res) => {
  try {
    const pool = getPool();
    const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_compradores,
                SUM(CASE WHEN pagado = true THEN 1 ELSE 0 END) as pagados,
                SUM(CASE WHEN pagado = false THEN 1 ELSE 0 END) as pendientes,
                ROUND((SUM(CASE WHEN pagado = true THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_pagado
            FROM compradores
        `);

    res.json(stats[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas de pago:", error);
    res.status(500).json({ error: "Error al obtener estadísticas de pago" });
  }
};  

// Health
const health = async (req, res) => {
  res.json({ status: "OK", message: "API funcionando correctamente" });
};

// ==================== MÉTODOS DE ADMINISTRACIÓN ====================

// Reiniciar la rifa (eliminar todos los compradores y liberar todos los números)
const reiniciarRifa = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Eliminar todos los compradores
    await connection.query("DELETE FROM compradores");

    // Liberar todos los números
    await connection.query("UPDATE numeros SET vendido = false");

    await connection.commit();

    res.json({
      success: true,
      message:
        "Rifa reiniciada exitosamente. Todos los números han sido liberados.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al reiniciar rifa:", error);
    res.status(500).json({ error: "Error al reiniciar la rifa" });
  } finally {
    connection.release();
  }
};

// Liberar un número específico (y eliminar su comprador)
const liberarNumero = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { numeroId } = req.params;

    if (!numeroId) {
      await connection.rollback();
      return res.status(400).json({ error: "ID del número es requerido" });
    }

    // Verificar que el número existe
    const [numero] = await connection.query(
      "SELECT id, vendido, numero FROM numeros WHERE id = ?",
      [numeroId],
    );

    if (numero.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Número no encontrado" });
    }

    // Eliminar el comprador asociado si existe
    await connection.query("DELETE FROM compradores WHERE numero_id = ?", [
      numeroId,
    ]);

    // Liberar el número
    await connection.query("UPDATE numeros SET vendido = false WHERE id = ?", [
      numeroId,
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: `Número ${numero[0].numero} liberado exitosamente`,
      numeroId,
      numero: numero[0].numero,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al liberar número:", error);
    res.status(500).json({ error: "Error al liberar el número" });
  } finally {
    connection.release();
  }
};

// Eliminar un comprador específico (y liberar su número)
const eliminarComprador = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { compradorId } = req.params;

    if (!compradorId) {
      await connection.rollback();
      return res.status(400).json({ error: "ID del comprador es requerido" });
    }

    // Obtener los datos del comprador
    const [comprador] = await connection.query(
      "SELECT id, numero_id FROM compradores WHERE id = ?",
      [compradorId],
    );

    if (comprador.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Comprador no encontrado" });
    }

    // Obtener información del número para la respuesta
    const [numero] = await connection.query(
      "SELECT numero FROM numeros WHERE id = ?",
      [comprador[0].numero_id],
    );

    // Eliminar el comprador
    await connection.query("DELETE FROM compradores WHERE id = ?", [
      compradorId,
    ]);

    // Liberar el número
    await connection.query("UPDATE numeros SET vendido = false WHERE id = ?", [
      comprador[0].numero_id,
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: "Comprador eliminado exitosamente y número liberado",
      compradorId,
      numeroLiberado: numero.length > 0 ? numero[0].numero : "N/A",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar comprador:", error);
    res.status(500).json({ error: "Error al eliminar el comprador" });
  } finally {
    connection.release();
  }
};  

export {
  getNumbers,
  getNumberById,
  purchaseNumber,
  getStats,
  getBuyers,
  markAsPaid,
  getPaymentStats,
  health,
  reiniciarRifa,
  liberarNumero,
  eliminarComprador,
};
