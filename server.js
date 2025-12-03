// server.js
const express = require('express');
const app = express();
const port = 3000;

// Configuración de Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger.js');

app.use(express.json());

// Ruta de Documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta Base
app.get('/', (req, res) => {
  res.send('¡Servidor del Gestor de Contraseñas funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`📄 Documentación disponible en http://localhost:${port}/api-docs`);
});