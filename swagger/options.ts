import swaggerJSDoc from 'swagger-jsdoc'

export const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scheduler REST API',
      version: '2.0.0',
    },
  },
  apis: ['**/*.ts'],
}
