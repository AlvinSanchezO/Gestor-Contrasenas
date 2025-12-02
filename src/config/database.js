// src/config/database.js
require('dotenv').config(); // Cargar variables del archivo .env
const { Sequelize } = require('sequelize');

// Configuración para TiDB Cloud (Protocolo MySQL)
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql', // TiDB usa el driver de MySQL
    dialectOptions: {
      ssl: {
        // TiDB requiere conexión segura (SSL) obligatoria
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    },
    logging: false // Para no llenar la consola de texto SQL
  }
);

module.exports = sequelize;