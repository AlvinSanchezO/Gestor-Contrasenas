<!-- GUÍA DE INTEGRACIÓN - FRONTEND & BACKEND -->
<!-- Gestor de Contraseñas - API REST -->

# 📚 GUÍA DE INTEGRACIÓN FRONTEND-BACKEND

## 1️⃣ REGISTRO DE USUARIO

### Endpoint
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json
```

### Request Body
```json
{
  "email": "usuario@gmail.com",
  "password": "contraseña_login_fuerte",
  "masterKey": "clave_maestra_diferente_fuerte"
}
```

### Response (201 Created)
```json
{
  "message": "Usuario registrado exitosamente",
  "userId": 1,
  "hint": "Recuerda tu Clave Maestra. La necesitarás para acceder a tus credenciales."
}
```

### Response Error (400)
```json
{
  "error": "La contraseña debe tener al menos 6 caracteres"
}
```

---

## 2️⃣ LOGIN DE USUARIO

### Endpoint
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

### Request Body
```json
{
  "email": "usuario@gmail.com",
  "password": "contraseña_login_fuerte"
}
```

### Response (200 OK)
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response Error (401)
```json
{
  "error": "Credenciales inválidas"
}
```

---

## 3️⃣ OBTENER CREDENCIALES (Protegido)

### Endpoint
```
GET http://localhost:3000/api/credentials
Authorization: Bearer {token}
x-secret-key: {masterKey}
Content-Type: application/json
```

### Headers Requeridos
| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer {token}` | Token JWT obtenido en login |
| `x-secret-key` | `{masterKey}` | Clave Maestra para descifrar |
| `Content-Type` | `application/json` | Tipo de contenido |

### Response (200 OK)
```json
[
  {
    "id": 1,
    "site_name": "Gmail",
    "site_url": "https://gmail.com",
    "username": "usuario@gmail.com",
    "password": "contraseña_descifrada",
    "notes": "Nota descifrada"
  },
  {
    "id": 2,
    "site_name": "GitHub",
    "site_url": "https://github.com",
    "username": "usuario_github",
    "password": "token_descifrado",
    "notes": "Token personal"
  }
]
```

### Response Error (400)
```json
{
  "error": "Falta x-secret-key"
}
```

---

## 4️⃣ CREAR CREDENCIAL (Protegido)

### Endpoint
```
POST http://localhost:3000/api/credentials
Authorization: Bearer {token}
x-secret-key: {masterKey}
Content-Type: application/json
```

### Request Body
```json
{
  "site_name": "Gmail",
  "site_url": "https://gmail.com",
  "username": "usuario@gmail.com",
  "password": "contraseña_secreta",
  "notes": "Cuenta principal de email"
}
```

### Headers Requeridos
| Header | Valor | Descripción |
|--------|-------|-------------|
| `Authorization` | `Bearer {token}` | Token JWT obtenido en login |
| `x-secret-key` | `{masterKey}` | Clave Maestra para cifrar |
| `Content-Type` | `application/json` | Tipo de contenido |

### Response (201 Created)
```json
{
  "message": "Credencial guardada exitosamente",
  "id": 1,
  "site_name": "Gmail"
}
```

### Response Error (500)
```json
{
  "error": "Error guardando credencial"
}
```

---

## 5️⃣ ACTUALIZAR CREDENCIAL (Protegido)

### Endpoint
```
PUT http://localhost:3000/api/credentials/{id}
Authorization: Bearer {token}
x-secret-key: {masterKey}
Content-Type: application/json
```

### Request Body
```json
{
  "site_name": "Gmail Actualizado",
  "site_url": "https://gmail.com",
  "username": "nuevo_usuario@gmail.com",
  "password": "nueva_contraseña",
  "notes": "Cuenta actualizada"
}
```

### Response (200 OK)
```json
{
  "message": "Credencial actualizada exitosamente",
  "id": 1
}
```

---

## 6️⃣ ELIMINAR CREDENCIAL (Protegido)

### Endpoint
```
DELETE http://localhost:3000/api/credentials/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### Response (200 OK)
```json
{
  "message": "Credencial eliminada exitosamente"
}
```

### Response Error (404)
```json
{
  "error": "Credencial no encontrada"
}
```

---

## 📋 FLUJO COMPLETO (Frontend)

### 1. Registro
```javascript
const registroData = {
  email: "usuario@gmail.com",
  password: "MiPassword123",
  masterKey: "MiClaveSecreta456"
};

const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registroData)
});
```

### 2. Login
```javascript
const loginData = {
  email: "usuario@gmail.com",
  password: "MiPassword123"
};

const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});

const { token } = await response.json();
// Guardar token en localStorage o sessionStorage
localStorage.setItem('token', token);
```

### 3. Obtener Credenciales
```javascript
const masterKey = "MiClaveSecreta456"; // Solicitada al usuario
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/credentials', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-secret-key': masterKey,
    'Content-Type': 'application/json'
  }
});

const credentials = await response.json();
```

### 4. Crear Credencial
```javascript
const newCredential = {
  site_name: "Gmail",
  site_url: "https://gmail.com",
  username: "usuario@gmail.com",
  password: "contraseña_secreta",
  notes: "Mi cuenta de email principal"
};

const response = await fetch('http://localhost:3000/api/credentials', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-secret-key': masterKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newCredential)
});
```

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

### Token JWT
- ✅ Se obtiene en login
- ✅ Expira en 1 hora
- ✅ Debe enviarse en header `Authorization: Bearer {token}`
- ✅ Almacenar en `localStorage` o `sessionStorage` (¡NO en cookies públicas!)

### Clave Maestra
- ✅ Se solicita en registro (diferente a contraseña)
- ✅ Se solicita cada vez que accedes a credenciales
- ✅ Nunca se almacena en el servidor
- ✅ Se envía en header `x-secret-key`
- ⚠️ **IMPORTANTE**: El usuario debe recordarla. Si la olvida, NO se puede recuperar

### Datos Cifrados
- ✅ Username, Password y Notes se cifran con AES-256-GCM
- ✅ Se almacena IV (Initialization Vector) y Auth Tag para integridad
- ✅ Solo se descifran con la Clave Maestra correcta

---

## 🧪 PRUEBAS CON POSTMAN/CURL

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Password123",
    "masterKey": "MasterKey456"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Password123"
  }'
```

### 3. Obtener Credenciales
```bash
curl -X GET http://localhost:3000/api/credentials \
  -H "Authorization: Bearer {token_aqui}" \
  -H "x-secret-key: MasterKey456" \
  -H "Content-Type: application/json"
```

### 4. Crear Credencial
```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Authorization: Bearer {token_aqui}" \
  -H "x-secret-key: MasterKey456" \
  -H "Content-Type: application/json" \
  -d '{
    "site_name": "Gmail",
    "site_url": "https://gmail.com",
    "username": "user@gmail.com",
    "password": "secreto",
    "notes": "Mi cuenta"
  }'
```

---

## ❌ CÓDIGOS DE ERROR COMUNES

| Código | Error | Causa |
|--------|-------|-------|
| 400 | Bad Request | Falta email, password o masterKey |
| 401 | Unauthorized | Token inválido o expirado |
| 400 | Falta x-secret-key | No enviaste la Clave Maestra |
| 500 | Server Error | Error en el servidor |

---

## 💡 VARIABLES DE ENTORNO (Frontend)

Crea un archivo `.env` en tu proyecto React:

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=5000
```

Y úsalo en tu código:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

---

**Última actualización**: Diciembre 9, 2025
**Versión del Backend**: 1.0
