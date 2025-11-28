// src/models/User.js
const { DataTypes } = require('sequelize');
// Nota: Importaremos la conexión 'sequelize' real en la siguiente tarea. 
// Por ahora, dejamos el esquema listo.

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
    // AQUÍ ESTÁ LA SEGURIDAD:
    master_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Hash Argon2 de la contraseña maestra"
    },
    kdf_salt: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Salt aleatoria para derivar la clave de cifrado"
    }
  }, {
    tableName: 'Users',
    timestamps: true // Crea created_at y updated_at automáticamente
  });

  return User;
};