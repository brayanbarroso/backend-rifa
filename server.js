import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import { initDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (opcional)
//app.use(express.static(path.join(__dirname, '../frontend')));
// app.use(
//   express.static(path.join(__dirname, "https://virtual-rifa.vercel.app/")),
// );

// Ruta raíz
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

// app.get("/", (req, res) => {
//   res.sendFile(
//     path.join(__dirname, "https://virtual-rifa.vercel.app/index.html"),
//   );
// });

// Iniciar servidor tras inicializar la DB y cargar rutas modulares
initDB().then(() => {
  app.use("/api", apiRoutes);

  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Error no manejado:", error);
});
