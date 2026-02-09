import jwt from "jsonwebtoken";

const validarAdmin = (req, res, next) => {
  let tokenJWt;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      tokenJWt = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(tokenJWt, process.env.JWT_SECRET);
      req.usuario = decoded;

      // Opcional: Verificar rol de administrador si existe en el JWT
      // if (decoded.role !== "admin") {
      //   return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador" });
      // }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token no válido o expirado" });
    }
  } else {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
};

export default validarAdmin;
