import jwt from "jsonwebtoken";
//generar un token de acceso
const generarJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // tiempo de expiracion del token
  });
};

export default generarJWT;
