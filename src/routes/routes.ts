import { Router } from 'express'
import boardRoutes from './board'
import eventRoutes from './event'
import issueRoutes from './issue'
import noteRoutes from './note'
import notificationRoutes from './notification'
import projectRoutes from './project'
import pushSubscriptionRoutes from './pushSubscription'
import scheduleRoutes from './schedule'
import statusRoutes from './status'

const router = Router()

router.use('/projects', projectRoutes)

router.use('/projects', scheduleRoutes)

router.use('/projects', eventRoutes)

router.use('/projects', notificationRoutes)

router.use('/projects', pushSubscriptionRoutes)

router.use('/projects', boardRoutes)

router.use('/projects', statusRoutes)

router.use('/projects', issueRoutes)

router.use('/projects', noteRoutes)

export default router
