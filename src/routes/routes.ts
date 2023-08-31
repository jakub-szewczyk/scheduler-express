import { Router } from 'express'
import projectRoutes from './project'
import scheduleRoutes from './schedule'

const router = Router()

router.use('/projects', projectRoutes)

router.use('/projects', scheduleRoutes)

export default router
