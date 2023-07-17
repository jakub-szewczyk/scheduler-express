import { Router } from 'express'
import projectRoutes from './project'

const router = Router()

router.use('/projects', projectRoutes)

export default router
