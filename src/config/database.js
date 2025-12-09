require('dotenv').config(); // Cargar variables del archivo .env
const { Sequelize } = require('sequelize');

// Configuración para SQL Server Local
const sequelize = new Sequelize(
 process.env.DB_NAME, 
 process.env.DB_USER, 
 process.env.DB_PASSWORD,
 {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 1433, // Puerto por defecto de SQL Server
  dialect: 'mssql', // Microsoft SQL Server
  dialectOptions: {
   authentication: {
    type: 'default',
    options: {
     userName: process.env.DB_USER,
     password: process.env.DB_PASSWORD
    }
   },
   options: {
    encrypt: true,
    trustServerCertificate: true, // Para conexión local sin certificado
    enableKeepAlive: true,
    instancename: process.env.DB_INSTANCE || 'SQLEXPRESS'
   }
  },
  logging: false // Para no llenar la consola de texto SQL
 }
);

module.exports = sequelize;