// src/models/index.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar definiciones de modelos
const defineUser = require('./User');
const defineCredential = require('./Credential');

// Inicializar modelos
const User = defineUser(sequelize);
const Credential = defineCredential(sequelize);

// Definir relaciones
User.hasMany(Credential, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

Credential.belongsTo(User, {
  foreignKey: 'user_id'
});

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  User,
  Credential
};
