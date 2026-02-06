import { getPool } from "../config/db.js";
import bcrypt from "bcryptjs";
import generarJWT from "../helpers/generarJWT.js";
import crypto from "crypto";

// Registrar nuevo usuario
export async function register(req, res) {
  try {
    const { username, password, passwordConfirm } = req.body;

    if (!username || !password || !passwordConfirm) {
      return res
        .status(400)
        .json({ error: "Username y password son requeridos" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const pool = getPool();

    // Verificar si el usuario ya existe
    const [userExists] = await pool.query(
      "SELECT username FROM users WHERE username = ?",
      [username],
    );

    if (userExists.length > 0) {
      return res
        .status(400)
        .json({ error: "El usuario ya existe en la base de datos" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const [result] = await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
    );

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
}

// Login - Autenticar usuario
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username y password son requeridos" });
    }

    const pool = getPool();

    // Buscar el usuario
    const [user] = await pool.query(
      "SELECT id, username, password FROM users WHERE username = ?",
      [username],
    );

    if (user.length === 0) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Usuario o contraseña incorrectos" });
    }

    // Generar JWT
    const token = generarJWT(user[0].id);

    // Generar session_token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Crear sesión en la base de datos
    await pool.query(
      "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
      [user[0].id, sessionToken],
    );

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      sessionToken,
      user: {
        id: user[0].id,
        username: user[0].username,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

// Obtener datos del usuario logueado
export async function getUserProfile(req, res) {
  try {
    const userId = req.usuario.id;

    const pool = getPool();

    const [user] = await pool.query(
      "SELECT id, username, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      success: true,
      user: user[0],
    });
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    return res.status(500).json({ error: "Error al obtener perfil" });
  }
}

// Logout - Eliminar sesión
export async function logout(req, res) {
  try {
    const userId = req.usuario.id;
    const { sessionToken } = req.body;

    const pool = getPool();

    // Eliminar la sesión
    const [result] = await pool.query(
      "DELETE FROM sessions WHERE user_id = ? AND session_token = ?",
      [userId, sessionToken],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    return res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
}

// Obtener todas las sesiones del usuario
export async function getUserSessions(req, res) {
  try {
    const userId = req.usuario.id;

    const pool = getPool();

    const [sessions] = await pool.query(
      "SELECT id, user_id, session_token, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error al obtener sesiones:", error);
    return res.status(500).json({ error: "Error al obtener sesiones" });
  }
}

// Cerrar todas las sesiones del usuario
export async function logoutAll(req, res) {
  try {
    const userId = req.usuario.id;

    const pool = getPool();

    const [result] = await pool.query(
      "DELETE FROM sessions WHERE user_id = ?",
      [userId],
    );

    return res.status(200).json({
      success: true,
      message: `Se cerraron ${result.affectedRows} sesiones`,
    });
  } catch (error) {
    console.error("Error al cerrar todas las sesiones:", error);
    return res.status(500).json({ error: "Error al cerrar sesiones" });
  }
}
