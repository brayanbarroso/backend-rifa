// Validar formato de username
export const validarUsername = (username) => {
  if (!username || typeof username !== "string") {
    return false;
  }
  // Username debe tener entre 3 y 50 caracteres, solo letras, números y guiones bajos
  const regex = /^[a-zA-Z0-9_]{3,50}$/;
  return regex.test(username);
};

// Validar formato de contraseña
export const validarPassword = (password) => {
  if (!password || typeof password !== "string") {
    return false;
  }
  // Al menos 6 caracteres
  return password.length >= 6;
};

// Validar que dos contraseñas coincidan
export const validarCoincidenciaPassword = (password, passwordConfirm) => {
  return password === passwordConfirm;
};

// Validar datos de registro
export const validarDatosRegistro = (username, password, passwordConfirm) => {
  const errores = [];

  if (!validarUsername(username)) {
    errores.push(
      "Username debe tener entre 3 y 50 caracteres (letras, números y guiones bajos)",
    );
  }

  if (!validarPassword(password)) {
    errores.push("Password debe tener al menos 6 caracteres");
  }

  if (!validarCoincidenciaPassword(password, passwordConfirm)) {
    errores.push("Las contraseñas no coinciden");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

// Validar datos de login
export const validarDatosLogin = (username, password) => {
  const errores = [];

  if (!username || typeof username !== "string" || username.trim() === "") {
    errores.push("Username es requerido");
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    errores.push("Password es requerido");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};
