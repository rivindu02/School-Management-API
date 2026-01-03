// src/config/swagger.ts

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: 'A comprehensive School Management System API with authentication, courses, teachers, and students management',
      contact: {
        name: 'API Support',
        email: 'support@schoolapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.school.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password', 'role'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              example: 'admin'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@test.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin123'
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              example: 'admin'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@test.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'admin123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                _id: {
                  type: 'string'
                },
                username: {
                  type: 'string'
                },
                email: {
                  type: 'string'
                },
                role: {
                  type: 'string'
                }
              }
            }
          }
        },
        Course: {
          type: 'object',
          required: ['title', 'code', 'credits'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              example: 'Advanced Mathematics'
            },
            code: {
              type: 'string',
              example: 'MATH301'
            },
            credits: {
              type: 'number',
              example: 3
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Teacher: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Dr. Mathematics'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'teacher@test.com'
            },
            courses: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of course IDs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Student: {
          type: 'object',
          required: ['name', 'email', 'age'],
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Alice Johnson'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'student@test.com'
            },
            age: {
              type: 'number',
              example: 20
            },
            courses: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of course IDs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        EnrollRequest: {
          type: 'object',
          required: ['courseId'],
          properties: {
            courseId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
              description: 'The ID of the course to enroll in'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      }
    },
    security: []
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
