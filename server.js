import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { initDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, "../frontend");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(frontendPath));

// Middleware para URLs amigables (sin .html)
// Intenta encontrar archivos .html cuando se solicita una ruta sin extensión
app.get("*", (req, res, next) => {
  // Saltar rutas de API
  if (req.path.startsWith("/api")) {
    return next();
  }

  const pathname = req.path;
  let filePath = null;

  // Casos especiales de mapeo de rutas
  const routeMap = {
    "/": "index.html",
    "/inicio": "index.html",
    "/compradores": "pages/buyers.html",
    "/buyers": "pages/buyers.html",
    "/admin": "pages/manager.html",
    "/manager": "pages/manager.html",
    "/administracion": "pages/manager.html",
    "/login": "login/login.html",
  };

  // Checar si la ruta existe en el mapeo
  if (routeMap[pathname]) {
    filePath = path.join(frontendPath, routeMap[pathname]);
  } else {
    // Intentar buscar archivo con .html
    filePath = path.join(frontendPath, pathname + ".html");

    // Si no existe, intentar como ruta en pages/
    if (!fs.existsSync(filePath)) {
      filePath = path.join(frontendPath, "pages", pathname + ".html");
    }
  }

  // Verificar si el archivo existe
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  // Si no es una ruta HTML válida, pasar al siguiente middleware
  next();
});

// Iniciar servidor tras inicializar la DB y cargar rutas modulares
initDB().then(() => {
  app.use("/api", apiRoutes);

  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend disponible con URLs amigables (sin .html)`);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Error no manejado:", error);
});
