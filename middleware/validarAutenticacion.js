import jwt from "jsonwebtoken";

const validarAutenticacion = (req, res, next) => {
  let tokenJWt;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Verificamos si existe el token en la cabecera de la peticion
    try {
      tokenJWt = req.headers.authorization.split(" ")[1]; // Bearer token
      const decoded = jwt.verify(tokenJWt, process.env.JWT_SECRET); // Verificamos el token
      req.usuario = decoded; // Guardamos el usuario decodificado en la request
      return next(); // Llamamos al siguiente middleware o ruta
    } catch (error) {
      // Si el token no existe, se retorna un error 401 (no autorizado)
      return res.status(401).json({ message: "Token no valido o expirado" });
    }
  } else {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
};

export default validarAutenticacion;
