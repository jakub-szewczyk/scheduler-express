import { Router } from 'express'
import projectRoutes from './project'
import rowRoutes from './row'
import scheduleRoutes from './schedule'

const router = Router()

router.use('/projects', projectRoutes)

router.use('/projects', scheduleRoutes)

router.use('/projects/', rowRoutes)

export default router
