import swaggerJsdoc, { Options } from 'swagger-jsdoc'
import { PORT } from '../config'

const swaggerOptions: Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My API Documentation',
      version: '1.0.0',
      description: 'Documentation for E-Commerce API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local Server',
      },
      {
        url: `https://e-commerce-bitcrafters-bn-1mpf.onrender.com`,
        description: 'Deployed Server',
      },
      {
        url: `/`,
        description: 'For pull requests',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] as string[] }],
  },
  apis: ['./src/docs/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export default swaggerSpec
