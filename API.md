# 📡 Documentación de la API

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Obtener todos los números

**GET** `/api/numbers`

Obtiene todos los números de la rifa (00-99) con su estado y datos del comprador si está vendido.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "numero": 0,
    "vendido": false,
    "numero_documento": null,
    "nombres": null,
    "apellidos": null,
    "telefono": null,
    "correo": null,
    "fecha_compra": null
  },
  {
    "id": 2,
    "numero": 1,
    "vendido": true,
    "numero_documento": "1234567890",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "correo": "juan@email.com",
    "fecha_compra": "2024-02-04T10:30:00.000Z"
  }
]
```

---

### 2. Obtener un número específico

**GET** `/api/numbers/:id`

Obtiene la información de un número específico por su ID.

**Parámetros:**

- `id` (number): ID del número en la base de datos

**Respuesta exitosa (200):**

```json
{
  "id": 25,
  "numero": 24,
  "vendido": true,
  "numero_documento": "1234567890",
  "nombres": "María",
  "apellidos": "González",
  "telefono": "3109876543",
  "correo": "maria@email.com",
  "fecha_compra": "2024-02-04T15:45:00.000Z"
}
```

**Error (404):**

```json
{
  "error": "Número no encontrado"
}
```

---

### 3. Comprar un número

**POST** `/api/purchase/:id`

Registra la compra de un número específico.

**Parámetros:**

- `id` (number): ID del número a comprar

**Body (JSON):**

```json
{
  "numero_documento": "1234567890",
  "nombres": "Carlos",
  "apellidos": "Rodríguez",
  "telefono": "3201234567",
  "correo": "carlos@email.com"
}
```

**Validaciones:**

- Todos los campos son obligatorios
- El número debe existir
- El número no debe estar vendido

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Número comprado exitosamente",
  "compradorId": 15
}
```

**Errores posibles:**

_400 - Datos incompletos:_

```json
{
  "error": "Todos los campos son obligatorios"
}
```

_400 - Número ya vendido:_

```json
{
  "error": "Este número ya fue vendido"
}
```

_404 - Número no existe:_

```json
{
  "error": "Número no encontrado"
}
```

---

### 4. Obtener estadísticas

**GET** `/api/stats`

Obtiene las estadísticas generales de la rifa.

**Respuesta exitosa (200):**

```json
{
  "total": 100,
  "vendidos": 45,
  "disponibles": 55
}
```

---

### 5. Obtener lista de compradores

**GET** `/api/buyers`

Obtiene la lista completa de compradores ordenados por fecha de compra.

**Respuesta exitosa (200):**

```json
[
  {
    "id": 1,
    "numero_id": 25,
    "numero": 24,
    "numero_documento": "1234567890",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "correo": "juan@email.com",
    "fecha_compra": "2024-02-04T10:30:00.000Z"
  }
]
```

---

### 6. Health Check

**GET** `/api/health`

Verifica que la API esté funcionando correctamente.

**Respuesta exitosa (200):**

```json
{
  "status": "OK",
  "message": "API funcionando correctamente"
}
```

---

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Después de hacer login, recibirás un token que debes incluir en el header `Authorization` de las peticiones protegidas.

### Header de Autenticación

```
Authorization: Bearer <tu_token_jwt>
```

---

### 7. Registrar nuevo usuario

**POST** `/api/auth/register`

Crea una nueva cuenta de usuario.

**Body (JSON):**

```json
{
  "username": "juan_perez",
  "password": "MiPassword123",
  "passwordConfirm": "MiPassword123"
}
```

**Validaciones:**

- Username: 3-50 caracteres (letras, números y guiones bajos)
- Password: mínimo 6 caracteres
- Las contraseñas deben coincidir
- Username debe ser único

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "userId": 1
}
```

**Errores posibles:**

_400 - Username ya existe:_

```json
{
  "error": "El usuario ya existe en la base de datos"
}
```

_400 - Datos inválidos:_

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "Username debe tener entre 3 y 50 caracteres (letras, números y guiones bajos)",
    "Password debe tener al menos 6 caracteres",
    "Las contraseñas no coinciden"
  ]
}
```

---

### 8. Login de usuario

**POST** `/api/auth/login`

Autentica a un usuario y retorna un JWT.

**Body (JSON):**

```json
{
  "username": "juan_perez",
  "password": "MiPassword123"
}
```

**Validaciones:**

- Username es requerido
- Password es requerido

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "a1b2c3d4e5f6...",
  "user": {
    "id": 1,
    "username": "juan_perez"
  }
}
```

**Errores posibles:**

_401 - Credenciales inválidas:_

```json
{
  "error": "Usuario o contraseña incorrectos"
}
```

_400 - Datos incompletos:_

```json
{
  "error": "Datos inválidos",
  "detalles": ["Username es requerido", "Password es requerido"]
}
```

---

### 9. Obtener perfil del usuario

**GET** `/api/users/profile`

Obtiene los datos del usuario autenticado. **Requiere autenticación.**

**Headers requeridos:**

```
Authorization: Bearer <tu_token_jwt>
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "juan_perez",
    "created_at": "2024-02-05T10:30:00.000Z"
  }
}
```

**Error sin autenticación (401):**

```json
{
  "message": "Token no proporcionado"
}
```

---

### 10. Logout

**POST** `/api/auth/logout`

Cierra la sesión actual. **Requiere autenticación.**

**Headers requeridos:**

```
Authorization: Bearer <tu_token_jwt>
```

**Body (JSON):**

```json
{
  "sessionToken": "a1b2c3d4e5f6..."
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Error sin autenticación (401):**

```json
{
  "message": "Token no proporcionado"
}
```

---

### 11. Obtener todas las sesiones del usuario

**GET** `/api/sessions`

Obtiene la lista de todas las sesiones activas del usuario autenticado. **Requiere autenticación.**

**Headers requeridos:**

```
Authorization: Bearer <tu_token_jwt>
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "user_id": 1,
      "session_token": "a1b2c3d4e5f6...",
      "created_at": "2024-02-05T10:30:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "session_token": "g7h8i9j10k11...",
      "created_at": "2024-02-05T14:20:00.000Z"
    }
  ]
}
```

---

### 12. Cerrar todos las sesiones

**POST** `/api/sessions/logout-all`

Cierra todas las sesiones del usuario autenticado. **Requiere autenticación.**

**Headers requeridos:**

```
Authorization: Bearer <tu_token_jwt>
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Se cerraron 2 sesiones"
}
```

---

## Códigos de Estado HTTP

- `200` - OK: Petición exitosa
- `400` - Bad Request: Datos inválidos o incompletos
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor

---

## Ejemplos de uso

### JavaScript (Fetch API)

#### Registrar usuario

```javascript
const response = await fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "juan_perez",
    password: "MiPassword123",
    passwordConfirm: "MiPassword123",
  }),
});
const result = await response.json();
```

#### Login

```javascript
const response = await fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "juan_perez",
    password: "MiPassword123",
  }),
});
const result = await response.json();
const token = result.token; // Guardar para luego
```

#### Petición con autenticación

```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const response = await fetch("http://localhost:3000/api/users/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const user = await response.json();
```

#### Comprar un número

```javascript
// Obtener todos los números
const response = await fetch("http://localhost:3000/api/numbers");
const numbers = await response.json();

// Comprar un número
const response = await fetch("http://localhost:3000/api/purchase/25", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    numero_documento: "1234567890",
    nombres: "Juan",
    apellidos: "Pérez",
    telefono: "3001234567",
    correo: "juan@email.com",
  }),
});
const result = await response.json();
```

### cURL

#### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "password": "MiPassword123",
    "passwordConfirm": "MiPassword123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "password": "MiPassword123"
  }'
```

#### Obtener perfil (con autenticación)

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Obtener todos los números

```bash
curl http://localhost:3000/api/numbers
```

#### Comprar un número

```bash
curl -X POST http://localhost:3000/api/purchase/25 \
  -H "Content-Type: application/json" \
  -d '{
    "numero_documento": "1234567890",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "correo": "juan@email.com"
  }'
```

#### Obtener estadísticas

```bash
curl http://localhost:3000/api/stats
```

### Python (Requests)

#### Registrar usuario

```python
import requests

response = requests.post('http://localhost:3000/api/auth/register', json={
    'username': 'juan_perez',
    'password': 'MiPassword123',
    'passwordConfirm': 'MiPassword123'
})
result = response.json()
```

#### Login

```python
import requests

response = requests.post('http://localhost:3000/api/auth/login', json={
    'username': 'juan_perez',
    'password': 'MiPassword123'
})
result = response.json()
token = result['token']  # Guardar para luego
```

#### Petición con autenticación

```python
import requests

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.get('http://localhost:3000/api/users/profile', headers=headers)
user = response.json()
```

#### Comprar un número

```python
import requests

data = {
    'numero_documento': '1234567890',
    'nombres': 'Juan',
    'apellidos': 'Pérez',
    'telefono': '3001234567',
    'correo': 'juan@email.com'
}
response = requests.post('http://localhost:3000/api/purchase/25', json=data)
result = response.json()
```

---

## Flujo de autenticación completo

1. **Registrar usuario** (si es nuevo)

   ```
   POST /api/auth/register
   ```

2. **Login**

   ```
   POST /api/auth/login
   ```

   - Recibe: `token` y `sessionToken`

3. **Usar el API con autenticación**

   ```
   GET /api/users/profile
   Header: Authorization: Bearer <token>
   ```

4. **Logout**
   ```
   POST /api/auth/logout
   Header: Authorization: Bearer <token>
   Body: { "sessionToken": "<sessionToken>" }
   ```

---

## CORS

La API está configurada para aceptar peticiones desde cualquier origen. En producción, se recomienda configurar orígenes específicos:

```javascript
app.use(
  cors({
    origin: "https://tu-dominio.com",
  }),
);
```

---

## Seguridad

**Recomendaciones para producción:**

1. Usar HTTPS
2. Implementar rate limiting
3. Validar y sanitizar todos los inputs
4. Usar variables de entorno para credenciales
5. Implementar autenticación/autorización
6. Configurar CORS específico
7. Agregar logs de auditoría

---

## Soporte

Para problemas o preguntas, revisa el README.md principal del proyecto.
