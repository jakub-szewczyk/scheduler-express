import swaggerJSDoc from 'swagger-jsdoc'
import { version } from '../package.json'

export const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scheduler REST API',
      version,
    },
  },
  apis: [process.env.NODE_ENV === 'development' ? '**/*.ts' : './dist/**/*.js'],
}
