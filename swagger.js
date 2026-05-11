import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collection Manager API — Lab 7',
      version: '1.0.0',
      description: 'RESTful API for managing a personal collection with JWT authentication and role-based access control'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from POST /auth/token'
        }
      },
      schemas: {
        Item: {
          type: 'object',
          properties: {
            id: { type: ['string', 'number'], description: 'Unique item identifier' },
            title: { type: 'string', description: 'Item title' },
            category: {
              type: 'string',
              enum: ['movie', 'series', 'anime', 'game', 'manga', 'comic', 'book', 'album', 'youtube'],
              description: 'Item category'
            },
            status: {
              type: 'string',
              enum: ['planned', 'in_progress', 'completed', 'dropped'],
              description: 'Collection status'
            },
            rating: { type: 'integer', minimum: 1, maximum: 10, nullable: true, description: 'User rating (1-10)' },
            coverUrl: { type: 'string', format: 'uri', description: 'Cover image URL' },
            notes: { type: 'string', description: 'User notes' },
            isHidden: { type: 'boolean', default: false, description: 'Whether item is hidden' }
          },
          required: ['id', 'title', 'category', 'status', 'coverUrl']
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
}

export const swaggerSpec = swaggerJsdoc(options)
