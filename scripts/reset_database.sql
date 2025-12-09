-- =========================================
-- Script SQL Server - LIMPIAR BASE DE DATOS
-- =========================================
-- Ejecuta este script para eliminar y recrear la base de datos limpia

USE master;
GO

-- 1. CERRAR CONEXIONES ACTIVAS
ALTER DATABASE GestorContrasenas SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- 2. ELIMINAR BASE DE DATOS
DROP DATABASE IF EXISTS GestorContrasenas;
GO

-- 3. CREAR LA BASE DE DATOS NUEVAMENTE
CREATE DATABASE GestorContrasenas;
GO

-- 4. USAR LA BASE DE DATOS
USE GestorContrasenas;
GO

-- 5. CREAR TABLA DE USUARIOS (ACTUALIZADA CON VALIDACIÓN DE CLAVE MAESTRA)
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    master_hash NVARCHAR(MAX) NOT NULL,          -- Hash Argon2 de la contraseña de login
    encryption_salt NVARCHAR(MAX) NOT NULL,      -- Salt para derivar la clave de cifrado
    master_key_hash NVARCHAR(MAX) NOT NULL,      -- Hash SHA256 de la Clave Maestra para validación
    kdf_salt NVARCHAR(MAX) NULL,                 -- Legacy, para compatibilidad
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IX_Users_Email ON Users(email);
GO

-- 6. CREAR TABLA DE CREDENCIALES
CREATE TABLE Credentials (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    site_name NVARCHAR(255) NOT NULL,
    site_url NVARCHAR(255) NULL,
    enc_username NVARCHAR(MAX) NOT NULL,         -- Base64 del username cifrado
    enc_password NVARCHAR(MAX) NOT NULL,         -- Base64 de la contraseña cifrada
    enc_notes NVARCHAR(MAX) NULL,                -- Base64 de las notas cifradas
    iv NVARCHAR(MAX) NOT NULL,                   -- Vector de inicialización (Hex)
    auth_tag NVARCHAR(MAX) NOT NULL,             -- Sello de integridad GCM (Hex)
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Credentials_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
GO

-- Crear índices para mejor rendimiento
CREATE INDEX IX_Credentials_UserId ON Credentials(user_id);
CREATE INDEX IX_Credentials_SiteName ON Credentials(site_name);
GO

-- 7. CREAR VISTA PARA INFORMACIÓN DE SEGURIDAD (auditoría)
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

-- 8. MOSTRAR CONFIRMACIÓN
SELECT 
    'Base de datos GestorContrasenas creada exitosamente' AS Mensaje,
    GETDATE() AS FechaCreacion
GO

SELECT 
    TABLE_NAME,
    'SQL Server' AS DatabaseType
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
