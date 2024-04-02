import { Router } from 'express'
import { getEventsController } from '../controllers/event'
import { getEventsValidator } from '../validators/event'

const router = Router()

router.get(
  '/:projectId/schedules/:scheduleId/events',
  getEventsValidator,
  getEventsController
)

export default router
