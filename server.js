// server.js
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors'); // <--- 1. IMPORTAR CORS
const app = express();
const port = 3000;

// --- IMPORTACIONES ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.js');

// Modelos y base de datos
const { sequelize } = require('./src/models');

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const credentialRoutes = require('./src/routes/credentialRoutes');

// Middleware de seguridad (Guardia)
const verifyToken = require('./src/middleware/authMiddleware');

// --- MIDDLEWARES GLOBALES ---

// 2. CONFIGURAR CORS para conexión con Frontend en React
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-secret-key'],
  credentials: true, // Permitir cookies/credenciales
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json()); // Habilitar JSON

// --- DOCUMENTACIÓN SWAGGER ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- RUTAS DE LA API ---

// 1. Autenticación (Públicas: Login y Registro)
app.use('/api/auth', authRoutes);

// 2. Credenciales / Bóveda (Privadas: Requieren Token)
app.use('/api/credentials', credentialRoutes);

// --- RUTA DE PRUEBA DE SEGURIDAD ---
app.get('/api/test-protegido', verifyToken, (req, res) => {
    res.json({ 
        message: '¡Felicidades! Entraste a la zona VIP.', 
        usuario: req.user 
    });
});

// --- RUTA BASE (Health Check) ---
app.get('/', (req, res) => {
  res.send('¡Servidor del Gestor de Contraseñas funcionando!');
});

// --- INICIALIZAR BASE DE DATOS Y SERVIDOR ---
sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Base de datos sincronizada correctamente');
  
  app.listen(port, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
    console.log(`📄 Documentación disponible en http://localhost:${port}/api-docs`);
  });
}).catch(error => {
  console.error('❌ Error al sincronizar la base de datos:', error);
  process.exit(1);
});