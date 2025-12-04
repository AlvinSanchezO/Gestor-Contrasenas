// server.js
const express = require('express');
const app = express();
const port = 3000;

// --- IMPORTACIONES ---
// 1. Configuración de Swagger (Documentación)
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.js');

// 2. Importar Rutas
const authRoutes = require('./src/routes/authRoutes');

// --- MIDDLEWARE ---
// Permite que el servidor entienda datos en formato JSON (necesario para POST)
app.use(express.json());

// --- RUTAS DE DOCUMENTACIÓN ---
// Accede aquí: http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- RUTAS DE LA API ---
// Aquí conectamos el módulo de autenticación
// La ruta final será: http://localhost:3000/api/auth/register
app.use('/api/auth', authRoutes);

// --- RUTA BASE (Prueba simple) ---
app.get('/', (req, res) => {
  res.send('¡Servidor del Gestor de Contraseñas funcionando!');
});

// --- INICIAR SERVIDOR ---
app.listen(port, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📄 Documentación disponible en http://localhost:${port}/api-docs`);
});