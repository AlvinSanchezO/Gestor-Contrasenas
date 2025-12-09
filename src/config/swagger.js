// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestor de Contraseñas API - Backend Seguro',
      version: '1.0.0',
      description: `
        # 🔐 API Segura para Gestión de Contraseñas

        ## Características de Seguridad:
        - ✅ Autenticación JWT (Token de 1 hora)
        - ✅ Cifrado AES-256-GCM end-to-end
        - ✅ Clave Maestra independiente de la contraseña
        - ✅ Validación de integridad (Auth Tag)
        - ✅ CORS habilitado para frontend en puerto 5173

        ## Flujo de Seguridad:
        1. **Registro**: Usuario crea contraseña + Clave Maestra
        2. **Login**: Se obtiene Token JWT (válido 1 hora)
        3. **Acceso a Credenciales**: Token + Clave Maestra (header x-secret-key)
        4. **Cifrado/Descifrado**: AES-256-GCM con IV y Auth Tag

        ## Headers Requeridos:
        - **Authorization**: Bearer {token} (para todas las rutas protegidas)
        - **x-secret-key**: {masterKey} (solo para GET/POST/PUT de credenciales)
      `,
      contact: {
        name: 'Equipo de Backend - Gestor de Contraseñas',
        email: 'backend@gestorcontrasenas.local'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor Local (Desarrollo)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en /auth/login. Válido por 1 hora.'
        },
        masterKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-secret-key',
          description: 'Clave Maestra para cifrar/descifrar credenciales. NO se almacena en servidor.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'usuario@gmail.com' },
            master_hash: { type: 'string', description: 'Hash Argon2 de la contraseña' },
            encryption_salt: { type: 'string', description: 'Salt para derivar clave de cifrado' },
            master_key_hash: { type: 'string', description: 'Hash SHA256 de la Clave Maestra' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Credential: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            site_name: { type: 'string', example: 'Netflix' },
            site_url: { type: 'string', nullable: true, example: 'https://netflix.com' },
            username: { type: 'string', example: 'usuario@gmail.com', description: 'Descifrado' },
            password: { type: 'string', example: '••••••••', description: 'Descifrado' },
            notes: { type: 'string', nullable: true, description: 'Descifrado' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CredentialEncrypted: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            site_name: { type: 'string' },
            site_url: { type: 'string' },
            enc_username: { type: 'string', description: 'Base64 cifrado' },
            enc_password: { type: 'string', description: 'Base64 cifrado' },
            enc_notes: { type: 'string', description: 'Base64 cifrado' },
            iv: { type: 'string', description: 'Vector de inicialización (Hex)' },
            auth_tag: { type: 'string', description: 'Sello de integridad GCM (Hex)' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Descripción del error' }
          }
        }
      }
    },
    // --- DEFINICIÓN DE ENDPOINTS ---
    paths: {
      // ============ AUTENTICACIÓN ============
      '/auth/register': {
        post: {
          tags: ['🔐 Autenticación'],
          summary: 'Registrar nuevo usuario',
          description: 'Crea un usuario con contraseña y Clave Maestra independientes.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'masterKey'],
                  properties: {
                    email: { 
                      type: 'string', 
                      format: 'email',
                      example: 'usuario@gmail.com',
                      description: 'Email único del usuario'
                    },
                    password: { 
                      type: 'string', 
                      example: 'MiPassword123',
                      description: 'Contraseña para login (min 6 caracteres)'
                    },
                    masterKey: { 
                      type: 'string', 
                      example: 'MiClaveSecreta456',
                      description: 'Clave Maestra para cifrar credenciales (min 6 caracteres)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { 
              description: 'Usuario registrado exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Usuario registrado exitosamente' },
                      userId: { type: 'integer', example: 1 },
                      hint: { type: 'string', example: 'Recuerda tu Clave Maestra...' }
                    }
                  }
                }
              }
            },
            400: { 
              description: 'Datos inválidos o usuario ya existe',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['🔐 Autenticación'],
          summary: 'Iniciar sesión',
          description: 'Verifica credenciales y retorna Token JWT válido por 1 hora.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { 
                      type: 'string', 
                      format: 'email',
                      example: 'usuario@gmail.com'
                    },
                    password: { 
                      type: 'string', 
                      example: 'MiPassword123'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { 
              description: 'Login exitoso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Login exitoso' },
                      token: { 
                        type: 'string', 
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        description: 'JWT válido por 1 hora'
                      }
                    }
                  }
                }
              }
            },
            401: { 
              description: 'Credenciales inválidas',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['🔐 Autenticación'],
          summary: 'Cerrar sesión',
          description: 'Indicación para el cliente de descartar el token (API stateless).',
          responses: {
            200: { 
              description: 'Sesión cerrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Sesión cerrada exitosamente' }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ============ BÓVEDA DE CREDENCIALES ============
      '/credentials': {
        get: {
          tags: ['🔓 Bóveda de Credenciales'],
          summary: 'Obtener todas las credenciales',
          description: 'Retorna las credenciales descifradas del usuario. Requiere Token + Clave Maestra.',
          security: [
            { bearerAuth: [] },
            { masterKeyAuth: [] }
          ],
          parameters: [
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para descifrar'
            }
          ],
          responses: {
            200: { 
              description: 'Lista de credenciales descifradas',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Credential' }
                  }
                }
              }
            },
            400: { 
              description: 'Falta Clave Maestra',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            401: { 
              description: 'Clave Maestra incorrecta o Token inválido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        },
        post: {
          tags: ['🔓 Bóveda de Credenciales'],
          summary: 'Crear nueva credencial',
          description: 'Cifra y guarda una nueva credencial. Requiere Token + Clave Maestra.',
          security: [
            { bearerAuth: [] },
            { masterKeyAuth: [] }
          ],
          parameters: [
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para cifrar'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['site_name', 'username', 'password'],
                  properties: {
                    site_name: { 
                      type: 'string', 
                      example: 'Netflix',
                      description: 'Nombre del servicio (visible)'
                    },
                    site_url: { 
                      type: 'string', 
                      nullable: true,
                      example: 'https://netflix.com',
                      description: 'URL del sitio (opcional, visible)'
                    },
                    username: { 
                      type: 'string', 
                      example: 'usuario@gmail.com',
                      description: 'Usuario/email (cifrado)'
                    },
                    password: { 
                      type: 'string', 
                      example: 'MiPassword123',
                      description: 'Contraseña (cifrada)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { 
              description: 'Credencial creada exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Credencial guardada exitosamente' },
                      id: { type: 'integer', example: 1 },
                      site_name: { type: 'string', example: 'Netflix' }
                    }
                  }
                }
              }
            },
            400: { description: 'Datos inválidos o Clave Maestra faltante' },
            401: { description: 'Clave Maestra incorrecta' }
          }
        }
      },
      '/credentials/{id}': {
        put: {
          tags: ['🔓 Bóveda de Credenciales'],
          summary: 'Actualizar credencial',
          description: 'Actualiza y re-cifra una credencial existente. Requiere Token + Clave Maestra.',
          security: [
            { bearerAuth: [] },
            { masterKeyAuth: [] }
          ],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la credencial'
            },
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para re-cifrar'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    site_name: { type: 'string', example: 'Netflix Actualizado' },
                    site_url: { type: 'string', nullable: true },
                    username: { type: 'string', example: 'nuevo@gmail.com' },
                    password: { type: 'string', example: 'NuevaClave2025' }
                  }
                }
              }
            }
          },
          responses: {
            200: { 
              description: 'Credencial actualizada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Credencial actualizada exitosamente' },
                      id: { type: 'integer' }
                    }
                  }
                }
              }
            },
            401: { description: 'Clave Maestra incorrecta' },
            404: { description: 'Credencial no encontrada' }
          }
        },
        delete: {
          tags: ['🔓 Bóveda de Credenciales'],
          summary: 'Eliminar credencial',
          description: 'Elimina permanentemente una credencial. Solo requiere Token (no Clave Maestra).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
              description: 'ID de la credencial a eliminar'
            }
          ],
          responses: {
            200: { 
              description: 'Credencial eliminada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Credencial eliminada exitosamente' }
                    }
                  }
                }
              }
            },
            401: { description: 'Token inválido o expirado' },
            404: { description: 'Credencial no encontrada' }
          }
        }
      }
    },
  },
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;