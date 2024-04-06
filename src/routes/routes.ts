import { Router } from 'express'
import boardRoutes from './board'
import eventRoutes from './event'
import noteRoutes from './note'
import notificationRoutes from './notification'
import projectRoutes from './project'
import scheduleRoutes from './schedule'
// import pushSubscriptionRoutes from './pushSubscription'
// import statusRoutes from './status'
// import issueRoutes from './issue'
// import contentRoutes from './content'

const router = Router()

router.use('/projects', projectRoutes)

router.use('/projects', scheduleRoutes)

router.use('/projects', eventRoutes)

router.use('/projects', notificationRoutes)

router.use('/projects', boardRoutes)

// router.use('/projects', statusRoutes)

// router.use('/projects', issueRoutes)

router.use('/projects', noteRoutes)

// router.use('/projects', contentRoutes)

// router.use('/push-subscriptions', pushSubscriptionRoutes)

export default router
