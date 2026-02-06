import mysql from "mysql2/promise";
import dbConfig from "./database.js";

let pool;

export async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log("✓ Conectado a la base de datos MySQL");

    // Inicializar números si la tabla está vacía
    await initializeNumbers();
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}

async function initializeNumbers() {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM numeros");

    if (rows[0].count === 0) {
      console.log("Inicializando números...");
      const values = Array.from({ length: 100 }, (_, i) => [i, false]);

      await pool.query("INSERT INTO numeros (numero, vendido) VALUES ?", [
        values,
      ]);

      console.log("✓ 100 números inicializados correctamente");
    }
  } catch (error) {
    console.error("Error al inicializar números:", error);
  }
}

export function getPool() {
  if (!pool) throw new Error("Pool no inicializado. Llama a initDB() primero.");
  return pool;
}
