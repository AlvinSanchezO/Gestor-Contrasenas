// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestor de Contraseñas API (MVP)',
      version: '1.0.0',
      description: 'Documentación oficial del Backend. Incluye Autenticación (JWT) y CRUD de Credenciales cifradas.',
      contact: {
        name: 'Equipo de Backend',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Prefijo estándar
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', 
          description: 'Ingrese el Token JWT obtenido en el Login'
        },
      },
    },
    // --- DEFINICIÓN MANUAL DE ENDPOINTS ---
    paths: {
      // --- 1. AUTENTICACIÓN ---
      '/auth/register': {
        post: {
          tags: ['Autenticación'],
          summary: 'Registrar nuevo usuario',
          description: 'Crea un usuario y genera su Salt maestra.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'usuario@demo.com' },
                    password: { type: 'string', example: 'MiClaveMaestra123!' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario creado exitosamente.' },
            400: { description: 'El usuario ya existe o datos inválidos.' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Autenticación'],
          summary: 'Iniciar Sesión',
          description: 'Verifica credenciales y retorna un Token JWT.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'usuario@demo.com' },
                    password: { type: 'string', example: 'MiClaveMaestra123!' }
                  }
                }
              }
            }
          },
          responses: {
            200: { 
              description: 'Login exitoso. Retorna el Token.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' }
                    }
                  }
                }
              }
            },
            401: { description: 'Contraseña incorrecta o usuario no encontrado.' }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Autenticación'],
          summary: 'Cerrar Sesión',
          description: 'Instrucción para que el cliente descarte el token (Stateless).',
          responses: {
            200: { 
              description: 'Sesión cerrada correctamente.',
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

      // --- 2. BÓVEDA DE CREDENCIALES (Requieren Token) ---
      '/credentials': {
        get: {
          tags: ['Bóveda'],
          summary: 'Obtener todas las credenciales',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para descifrar los datos'
            }
          ],
          responses: {
            200: { description: 'Lista de credenciales descifradas.' },
            400: { description: 'Falta x-secret-key.' }
          }
        },
        post: {
          tags: ['Bóveda'],
          summary: 'Guardar nueva credencial',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para cifrar los datos'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    site_name: { type: 'string', example: 'Netflix' },
                    site_url: { type: 'string', example: 'https://netflix.com' },
                    username: { type: 'string', example: 'juan@gmail.com' },
                    password: { type: 'string', example: 'SuperSecret123' },
                    notes: { type: 'string', example: 'Cuenta compartida' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Credencial cifrada y guardada.' }
          }
        }
      },
      '/credentials/{id}': {
        put: {
          tags: ['Bóveda'],
          summary: 'Actualizar una credencial',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
            {
              in: 'header',
              name: 'x-secret-key',
              schema: { type: 'string' },
              required: true,
              description: 'Clave Maestra para re-cifrar los datos'
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    site_name: { type: 'string', example: 'Netflix' },
                    site_url: { type: 'string', example: 'https://netflix.com' },
                    username: { type: 'string', example: 'juan@gmail.com' },
                    password: { type: 'string', example: 'NuevaClave2025' },
                    notes: { type: 'string', example: 'Actualizado' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Actualizado correctamente.' }
          }
        },
        delete: {
          tags: ['Bóveda'],
          summary: 'Eliminar una credencial',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Eliminado correctamente.' }
          }
        }
      }
    },
  },
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;