import { Router } from 'express'
import {
  getScheduleValidator,
  getSchedulesValidator,
} from '../validators/schedule'
import {
  getScheduleController,
  getSchedulesController,
} from '../controllers/schedule'

const router = Router()

router.get(
  '/:projectId/schedules',
  getSchedulesValidator,
  getSchedulesController
)

router.get(
  '/:projectId/schedules/:scheduleId',
  getScheduleValidator,
  getScheduleController
)

export default router
