import { Router } from 'express'
import { createProjectController } from '../controllers/project'

const router = Router()

router.post('/', createProjectController)

export default router
