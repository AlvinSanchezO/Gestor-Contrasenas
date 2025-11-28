// src/models/Credential.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Credential = sequelize.define('Credential', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
      // La relación se definirá en el archivo principal de DB
    },
    // --- DATOS VISIBLES (METADATOS) ---
    site_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    site_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // --- DATOS SECRETOS (CIFRADOS) ---
    enc_username: {
      type: DataTypes.STRING, // Base64 del cifrado
      allowNull: false
    },
    enc_password: {
      type: DataTypes.STRING, // Base64 del cifrado
      allowNull: false
    },
    enc_notes: {
      type: DataTypes.TEXT,   // Base64 del cifrado
      allowNull: true
    },
    // --- SEGURIDAD ---
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Vector de Inicialización único (Hex)"
    },
    auth_tag: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Sello de integridad GCM (Hex)"
    }
  }, {
    tableName: 'Credentials',
    timestamps: true
  });

  return Credential;
};