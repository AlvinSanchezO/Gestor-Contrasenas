// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestor de Contraseñas API',
      version: '1.0.0',
      description: 'Documentación de la API para el Gestor de Contraseñas Seguro (MVP)',
      contact: {
        name: 'Soporte Técnico',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo',
      },
    ],
  },
  // Aquí indicamos dónde buscar los comentarios de documentación
  // (Buscaremos en las rutas que crearemos pronto)
  apis: ['./src/routes/*.js', './server.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;