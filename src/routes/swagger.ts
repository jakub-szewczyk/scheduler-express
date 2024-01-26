import { Router } from 'express'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'
import { options } from '../../swagger/options'

const router = Router()

router.use('/', swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(options)))

export default router
