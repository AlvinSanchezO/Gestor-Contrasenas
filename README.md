# 🔐 GestorSeguro - Backend API

Backend seguro para gestión de contraseñas con cifrado end-to-end AES-256-GCM.

## 🌟 Características

- ✅ **Autenticación JWT**: Tokens seguros de 1 hora
- ✅ **Cifrado End-to-End**: AES-256-GCM con IV y Auth Tag
- ✅ **Clave Maestra Independiente**: Separada de la contraseña de login
- ✅ **SQL Server Local**: Base de datos segura en tu máquina
- ✅ **CORS Habilitado**: Para frontend en React en puerto 5173
- ✅ **Documentación Swagger**: API documentation interactiva en `/api-docs`

## 🚀 Stack Tecnológico

- **Node.js** v20.19.5
- **Express.js** - Framework web
- **Sequelize** - ORM para SQL Server
- **bcryptjs** - Hash de contraseñas (Argon2)
- **jsonwebtoken** - Autenticación JWT
- **crypto** - Cifrado AES-256-GCM
- **SQL Server** - Base de datos local

## 📋 Requisitos Previos

- Node.js v18+
- SQL Server 2019+ (LocalDB o Express)
- npm o yarn

## 🔧 Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/AlvinSanchezO/GestorSeguro.git
cd GestorSeguro
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos

**Opción A: Crear base de datos manualmente (Recomendado)**

1. Abre SQL Server Management Studio (SSMS)
2. Ejecuta el script en `scripts/reset_database.sql`
3. Verifica que la BD `GestorContrasenas` se creó

**Opción B: Dejar que Sequelize la cree**

El servidor sincronizará automáticamente los modelos en el primer inicio.

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
# Base de Datos SQL Server
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu_contraseña_sql_server
DB_NAME=GestorContrasenas
DB_INSTANCE=SQLEXPRESS

# Servidor
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_y_larga_2024
```

**⚠️ IMPORTANTE**: Cambia `JWT_SECRET` y `DB_PASSWORD` con valores seguros.

### 5. Iniciar servidor

```bash
npm run dev
# O
node server.js
```

Deberías ver:
```
✅ Base de datos sincronizada correctamente
🚀 Servidor corriendo en http://localhost:3000
📄 Documentación disponible en http://localhost:3000/api-docs
```

## 📚 API Documentation

### Acceder a Swagger UI
```
http://localhost:3000/api-docs
```

### Endpoints principales

#### 🔐 Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

#### 🔓 Credenciales
- `GET /api/credentials` - Obtener todas (requiere Token + Clave Maestra)
- `POST /api/credentials` - Crear nueva (requiere Token + Clave Maestra)
- `PUT /api/credentials/:id` - Actualizar (requiere Token + Clave Maestra)
- `DELETE /api/credentials/:id` - Eliminar (requiere Token)

Ver documentación completa en `/api-docs`

## 🔐 Flujo de Seguridad

### 1. Registro
```javascript
POST /api/auth/register
{
  "email": "usuario@gmail.com",
  "password": "contraseña_login",      // Para autenticación
  "masterKey": "clave_maestra"         // Para cifrar datos
}
```

### 2. Login
```javascript
POST /api/auth/login
{
  "email": "usuario@gmail.com",
  "password": "contraseña_login"
}
// Respuesta:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."  // JWT válido 1 hora
}
```

### 3. Acceder a Credenciales
```javascript
GET /api/credentials
Headers:
  Authorization: Bearer {token}
  x-secret-key: {masterKey}
```

### 4. Cifrado de Datos
- Username, Password y Notes se cifran con **AES-256-GCM**
- Cada credencial tiene su propio **IV (Vector de Inicialización)**
- Se incluye **Auth Tag** para validar integridad

## 📁 Estructura del Proyecto

```
.
├── src/
│   ├── config/
│   │   ├── database.js        # Conexión SQL Server + Sequelize
│   │   └── swagger.js         # Configuración Swagger/OpenAPI
│   ├── controllers/
│   │   ├── authController.js  # Login, Registro, Logout
│   │   └── credentialController.js  # CRUD Credenciales
│   ├── middleware/
│   │   ├── authMiddleware.js  # Validación JWT
│   │   └── masterKeyMiddleware.js  # Validación Clave Maestra
│   ├── models/
│   │   ├── User.js            # Modelo Usuario
│   │   ├── Credential.js      # Modelo Credencial
│   │   └── index.js           # Inicialización modelos
│   ├── routes/
│   │   ├── authRoutes.js      # Rutas autenticación
│   │   └── credentialRoutes.js # Rutas credenciales
│   └── utils/
│       └── encryption.js      # Funciones cifrado/descifrado
├── scripts/
│   ├── create_database.sql    # Script crear BD
│   └── reset_database.sql     # Script limpiar BD
├── server.js                  # Punto de entrada
├── package.json
└── README.md
```

## 🧪 Pruebas

### Con Postman/Insomnia

1. **Registrar usuario**
```bash
POST http://localhost:3000/api/auth/register
{
  "email": "test@gmail.com",
  "password": "Password123",
  "masterKey": "MasterKey456"
}
```

2. **Login**
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "test@gmail.com",
  "password": "Password123"
}
```

3. **Agregar credencial**
```bash
POST http://localhost:3000/api/credentials
Headers:
  Authorization: Bearer {token_aqui}
  x-secret-key: MasterKey456

{
  "site_name": "Netflix",
  "site_url": "netflix.com",
  "username": "user@gmail.com",
  "password": "micontraseña"
}
```

## 🔒 Seguridad

### Consideraciones implementadas:
- ✅ Contraseña hasheada con bcryptjs (Argon2)
- ✅ JWT con expiración de 1 hora
- ✅ Clave Maestra nunca se almacena (se valida por hash)
- ✅ Datos cifrados en Base64 + AES-256-GCM
- ✅ CORS restringido a frontend autorizado
- ✅ No hay logs de datos sensibles
- ✅ Variables de entorno protegidas (.gitignore)

### Recomendaciones adicionales:
- [ ] Usar HTTPS en producción
- [ ] Implementar rate limiting
- [ ] Agregar 2FA (Two-Factor Authentication)
- [ ] Implementar refresh tokens
- [ ] Agregar auditoría de accesos
- [ ] Usar variables de entorno en producción

## 📖 Documentación Adicional

- [API Integration Guide](./API_INTEGRATION_GUIDE.md) - Guía de integración frontend
- [Scripts SQL Server](./scripts/) - Scripts de base de datos

## 🤝 Contribuir

Este proyecto es parte del Gestor de Contraseñas personal. Para contribuciones:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Agregar mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📝 Licencia

MIT License - Ver archivo LICENSE

## 👤 Autor

**Alvin Sánchez**
- GitHub: [@AlvinSanchezO](https://github.com/AlvinSanchezO)

## 📞 Soporte

Para reportar bugs o sugerencias: [Crear un Issue](https://github.com/AlvinSanchezO/GestorSeguro/issues)

---

**Última actualización**: Diciembre 9, 2025

**⚠️ Nota de Seguridad**: Este backend está diseñado para demostración. Para usar en producción, implementa validaciones adicionales y considera aspectos de seguridad avanzados.
