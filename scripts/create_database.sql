-- =========================================
-- Script SQL Server - Gestor de Contraseñas
-- =========================================
-- Base de datos local para gestión segura de contraseñas
-- Crear esta base de datos antes de ejecutar la aplicación

-- 1. CREAR LA BASE DE DATOS
IF EXISTS (SELECT * FROM sys.databases WHERE name = N'GestorContrasenas')
BEGIN
    DROP DATABASE GestorContrasenas;
END
GO

CREATE DATABASE GestorContrasenas;
GO

-- 2. USAR LA BASE DE DATOS
USE GestorContrasenas;
GO

-- 3. CREAR TABLA DE USUARIOS
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    master_hash NVARCHAR(MAX) NOT NULL,  -- Hash Argon2 de la contraseña maestra
    kdf_salt NVARCHAR(MAX) NOT NULL,     -- Salt para derivar la clave de cifrado
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IX_Users_Email ON Users(email);
GO

-- 4. CREAR TABLA DE CREDENCIALES
CREATE TABLE Credentials (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    site_name NVARCHAR(255) NOT NULL,
    site_url NVARCHAR(255) NULL,
    enc_username NVARCHAR(MAX) NOT NULL,  -- Base64 del username cifrado
    enc_password NVARCHAR(MAX) NOT NULL,  -- Base64 de la contraseña cifrada
    enc_notes NVARCHAR(MAX) NULL,         -- Base64 de las notas cifradas
    iv NVARCHAR(MAX) NOT NULL,            -- Vector de inicialización (Hex)
    auth_tag NVARCHAR(MAX) NOT NULL,      -- Sello de integridad GCM (Hex)
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Credentials_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- Crear índices para mejor rendimiento
CREATE INDEX IX_Credentials_UserId ON Credentials(user_id);
CREATE INDEX IX_Credentials_SiteName ON Credentials(site_name);
GO

-- 5. CREAR VISTA PARA INFORMACIÓN DE SEGURIDAD (auditoría)
CREATE VIEW vw_UserCredentialsCount AS
SELECT 
    u.id,
    u.email,
    COUNT(c.id) AS credential_count,
    u.createdAt
FROM Users u
LEFT JOIN Credentials c ON u.id = c.user_id
GROUP BY u.id, u.email, u.createdAt;
GO

-- 6. INSERTAR DATOS DE PRUEBA (opcional)
-- NOTA: Los valores de hash y encriptación son ficticios para demostración
-- En producción, estos deben generarse por la aplicación

-- Insertar usuario de prueba
INSERT INTO Users (email, master_hash, kdf_salt)
VALUES 
(
    'usuario@example.com',
    '$argon2id$v=19$m=19456,t=2,p=1$pLqPzRTLbYDgvGxzQbLhqA$8Y+qUNhJzW8vYlzq/eXf5lQU4pLsX5nCJmYqLsxc2H8',  -- Hash ejemplo Argon2
    'abcdef1234567890abcdef1234567890'  -- Salt ejemplo
);
GO

-- Insertar credenciales de prueba
INSERT INTO Credentials (user_id, site_name, site_url, enc_username, enc_password, enc_notes, iv, auth_tag)
VALUES
(
    1,
    'Gmail',
    'https://gmail.com',
    'dXNlckBnbWFpbC5jb20=',  -- Base64 de username cifrado (ejemplo)
    'Y2lmcmFkbysgc2VjcmV0bw==',  -- Base64 de contraseña cifrada (ejemplo)
    'QWxndW5hcyBub3RhcyBkZSBwcnVlYmE=',  -- Base64 de notas (ejemplo)
    'a1b2c3d4e5f6g7h8',  -- IV (ejemplo)
    'x9y8z7w6v5u4t3s2'   -- Auth Tag (ejemplo)
);
GO

-- 7. CREAR STORED PROCEDURES ÚTILES

-- Procedure para obtener todas las credenciales de un usuario
CREATE PROCEDURE sp_GetUserCredentials
    @user_id INT
AS
BEGIN
    SELECT 
        id,
        user_id,
        site_name,
        site_url,
        enc_username,
        enc_password,
        enc_notes,
        iv,
        auth_tag,
        createdAt,
        updatedAt
    FROM Credentials
    WHERE user_id = @user_id
    ORDER BY createdAt DESC;
END
GO

-- Procedure para obtener información del usuario
CREATE PROCEDURE sp_GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SELECT 
        id,
        email,
        master_hash,
        kdf_salt,
        createdAt,
        updatedAt
    FROM Users
    WHERE email = @email;
END
GO

-- Procedure para eliminar todas las credenciales de un usuario
CREATE PROCEDURE sp_DeleteUserCredentials
    @user_id INT
AS
BEGIN
    DELETE FROM Credentials
    WHERE user_id = @user_id;
END
GO

-- 8. INFORMACIÓN DE SEGURIDAD
/*
CONSIDERACIONES DE SEGURIDAD IMPLEMENTADAS:
1. master_hash: Almacena el hash Argon2 (nunca la contraseña en texto plano)
2. kdf_salt: Salt única para derivar la clave de cifrado
3. enc_username, enc_password, enc_notes: Datos cifrados en Base64
4. iv (Initialization Vector): Único para cada cifrado
5. auth_tag: Sello de integridad GCM para validar la integridad
6. Relaciones: FK de Credentials a Users con DELETE CASCADE
7. Índices: Para optimizar búsquedas por email y usuario_id
8. Timestamps: Rastrean creación y actualización de registros
*/

-- 9. INFORMACIÓN DE CONEXIÓN
/*
Cadena de conexión para la aplicación (Node.js con Sequelize):

Opción 1: Windows Authentication (Recomendado para local)
Server=localhost\SQLEXPRESS;Database=GestorContrasenas;Trusted_Connection=yes;

Opción 2: SQL Server Authentication
Server=localhost;Database=GestorContrasenas;User Id=sa;Password=TuContraseña;

Variables de entorno (.env):
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa (o tu usuario SQL Server)
DB_PASSWORD=TuContraseña
DB_NAME=GestorContrasenas
DB_DIALECT=mssql (para Sequelize)
*/

-- 10. MOSTRAR INFORMACIÓN DE LAS TABLAS CREADAS
SELECT 
    TABLE_NAME,
    'SQL Server' AS DatabaseType,
    GETDATE() AS CreatedDate
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
