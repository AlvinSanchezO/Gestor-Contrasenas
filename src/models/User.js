// src/models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    // --- AUTENTICACIÓN ---
    master_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Hash Argon2 de la contraseña de login"
    },
    // --- CIFRADO DE CREDENCIALES ---
    encryption_salt: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Salt para derivar la clave de cifrado de credenciales"
    },
    // --- VALIDACIÓN DE CLAVE MAESTRA ---
    master_key_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Hash SHA256 de la Clave Maestra para validación"
    },
    kdf_salt: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Salt aleatoria para derivar la clave de cifrado (legacy)"
    }
  }, {
    tableName: 'Users',
    timestamps: true // Crea created_at y updated_at automáticamente
  });

  return User;
};