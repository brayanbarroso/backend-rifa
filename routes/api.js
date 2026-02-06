import express from "express";
import * as controllers from "../controllers/apiControllers.js";
import * as userControllers from "../controllers/userControllers.js";
import {
  validarDatosRegistroMiddleware,
  validarDatosLoginMiddleware,
} from "../middleware/validarDatos.js";
import validarAutenticacion from "../middleware/validarAutenticacion.js";

const router = express.Router();

// ==================== RUTAS DE NÚMEROS Y COMPRAS ====================
router.get("/numbers", controllers.getNumbers);
router.get("/numbers/:id", controllers.getNumberById);
router.post("/purchase/:id", controllers.purchaseNumber);
router.get("/stats", controllers.getStats);
router.get("/buyers", controllers.getBuyers);

// ==================== RUTAS DE PAGO ====================
router.put("/buyers/:compradorId/payment", controllers.markAsPaid);
router.get("/payment-stats", controllers.getPaymentStats);

router.get("/health", controllers.health);

// ==================== RUTAS DE USUARIOS ====================
// Registro y Login (sin autenticación)
router.post(
  "/auth/register",
  validarDatosRegistroMiddleware,
  userControllers.register,
);
router.post("/auth/login", validarDatosLoginMiddleware, userControllers.login);

// Rutas protegidas (requieren autenticación)
router.get(
  "/users/profile",
  validarAutenticacion,
  userControllers.getUserProfile,
);
router.post("/auth/logout", validarAutenticacion, userControllers.logout);

// ==================== RUTAS DE SESIONES ====================
router.get("/sessions", validarAutenticacion, userControllers.getUserSessions);
router.post(
  "/sessions/logout-all",
  validarAutenticacion,
  userControllers.logoutAll,
);

export default router;
