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
        url: 'http://localhost:3000/api', // IMPORTANTE: Agregamos /api como prefijo estándar
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
      // 1. AUTENTICACIÓN
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

      // 2. BÓVEDA DE CREDENCIALES (Requieren Token)
      '/credentials': {
        get: {
          tags: ['Bóveda'],
          summary: 'Obtener todas las credenciales',
          security: [{ bearerAuth: [] }], // Candado Cerrado
          responses: {
            200: { description: 'Lista de credenciales (descifradas o resumen).' }
          }
        },
        post: {
          tags: ['Bóveda'],
          summary: 'Guardar nueva credencial',
          security: [{ bearerAuth: [] }],
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
        get: {
          tags: ['Bóveda'],
          summary: 'Obtener una credencial específica',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: {
            200: { description: 'Datos de la credencial descifrados.' },
            404: { description: 'Credencial no encontrada.' }
          }
        },
        put: {
          tags: ['Bóveda'],
          summary: 'Actualizar una credencial',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    password: { type: 'string', example: 'NuevaClave2025' }
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
  apis: [], // Dejamos esto vacío porque definimos todo arriba manualmente
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;