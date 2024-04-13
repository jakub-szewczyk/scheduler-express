import { Router } from 'express'
import { createPushSubscriptionController } from '../controllers/pushSubscription'
import { createPushSubscriptionValidator } from '../validators/pushSubscription'

const router = Router()

router.post(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification/push-subscriptions',
  createPushSubscriptionValidator,
  createPushSubscriptionController
)

export default router
