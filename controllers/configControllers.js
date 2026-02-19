import { getPool } from "../config/db.js";

// ============================================
// Obtener configuración actual de la rifa
// ============================================
const obtenerConfig = async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query("SELECT * FROM config_rifa LIMIT 1");

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontró configuración de la rifa",
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error al obtener config:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener configuración",
      error: error.message,
    });
  }
};

// ============================================
// Actualizar configuración de la rifa
// ============================================
const actualizarConfig = async (req, res) => {
  try {
    const { fecha_rifa, loteria, valor_rifa, premio, medio_pago, responsable } =
      req.body;

    // Validar que al menos un campo sea proporcionado
    if (
      !fecha_rifa &&
      !loteria &&
      !valor_rifa &&
      !premio &&
      !medio_pago &&
      !responsable
    ) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    // Construir la consulta dinámicamente
    let updateFields = [];
    let params = [];

    if (fecha_rifa) {
      updateFields.push("fecha_rifa = ?");
      params.push(fecha_rifa);
    }
    if (loteria) {
      updateFields.push("loteria = ?");
      params.push(loteria);
    }
    if (valor_rifa !== undefined) {
      updateFields.push("valor_rifa = ?");
      params.push(valor_rifa);
    }
    if (premio !== undefined) {
      updateFields.push("premio = ?");
      params.push(premio);
    }
    if (medio_pago) {
      updateFields.push("medio_pago = ?");
      params.push(medio_pago);
    }
    if (responsable) {
      updateFields.push("responsable = ?");
      params.push(responsable);
    }

    const pool = getPool();

    const sqlQuery = `UPDATE config_rifa SET ${updateFields.join(", ")} WHERE id = 1`;

    await pool.query(sqlQuery, params);

    // Retornar la configuración actualizada
    const result = await pool.query("SELECT * FROM config_rifa WHERE id = 1");

    res.json({
      success: true,
      message: "Configuración actualizada correctamente",
      data: result[0],
    });
  } catch (error) {
    console.error("Error al actualizar config:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar configuración",
      error: error.message,
    });
  }
};

// ============================================
// Actualizar un campo específico
// ============================================
const actualizarCampo = async (req, res) => {
  try {
    const { campo } = req.params;
    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({
        success: false,
        message: "El valor es requerido",
      });
    }

    // Validar que el campo sea válido
    const camposValidos = [
      "fecha_rifa",
      "loteria",
      "valor_rifa",
      "premio",
      "medio_pago",
      "responsable",
    ];

    if (!camposValidos.includes(campo)) {
      return res.status(400).json({
        success: false,
        message: `Campo inválido. Campos válidos: ${camposValidos.join(", ")}`,
      });
    }

    const pool = getPool();
    const sqlQuery = `UPDATE config_rifa SET ${campo} = ? WHERE id = 1`;
    await pool.query(sqlQuery, [valor]);

    const result = await pool.query("SELECT * FROM config_rifa WHERE id = 1");

    res.json({
      success: true,
      message: `${campo} actualizado correctamente`,
      data: result[0],
    });
  } catch (error) {
    console.error("Error al actualizar campo:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar campo",
      error: error.message,
    });
  }
};

export { obtenerConfig, actualizarConfig, actualizarCampo };
