// server.js
require('dotenv').config(); // Cargar variables de entorno (JWT_SECRET)
const express = require('express');
const app = express();
const port = 3000;

// --- IMPORTACIONES ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.js');
const authRoutes = require('./src/routes/authRoutes');
const verifyToken = require('./src/middleware/authMiddleware'); // <--- NUEVO: El Guardia

// --- MIDDLEWARES GLOBALES ---
app.use(express.json()); // Entender JSON

// --- DOCUMENTACIÓN (Swagger) ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- RUTAS DE AUTENTICACIÓN (Login/Registro) ---
app.use('/api/auth', authRoutes);


// --- RUTA PROTEGIDA DE PRUEBA (SOLO PARA PROBAR EL TOKEN) ---
// Fíjate que 'verifyToken' está en medio. Si no tienes token, no pasas.
app.get('/api/test-protegido', verifyToken, (req, res) => {
    res.json({ 
        message: '¡Felicidades! Entraste a la zona VIP.', 
        usuario: req.user // Te muestra los datos que venían dentro de tu Token
    });
});


// --- RUTA BASE (Estado del servidor) ---
app.get('/', (req, res) => {
  res.send('¡Servidor del Gestor de Contraseñas funcionando!');
});

// --- INICIAR SERVIDOR ---
app.listen(port, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📄 Documentación disponible en http://localhost:${port}/api-docs`);
});