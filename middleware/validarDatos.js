import {
  validarDatosRegistro,
  validarDatosLogin,
} from "../helpers/validarDatosUsuario.js";

// Middleware para validar datos de registro
export const validarDatosRegistroMiddleware = (req, res, next) => {
  const { username, password, passwordConfirm } = req.body;

  const validacion = validarDatosRegistro(username, password, passwordConfirm);

  if (!validacion.valido) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: validacion.errores,
    });
  }

  next();
};

// Middleware para validar datos de login
export const validarDatosLoginMiddleware = (req, res, next) => {
  const { username, password } = req.body;

  const validacion = validarDatosLogin(username, password);

  if (!validacion.valido) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: validacion.errores,
    });
  }

  next();
};
