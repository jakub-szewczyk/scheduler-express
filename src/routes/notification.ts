import { Router } from 'express'
import { getNotificationController } from '../controllers/notification'
import { getNotificationValidator } from '../validators/notification'

const router = Router()

router.get(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification',
  getNotificationValidator,
  getNotificationController
)

export default router
