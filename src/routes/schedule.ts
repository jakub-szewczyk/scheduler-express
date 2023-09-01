import { Router } from 'express'
import {
  createScheduleValidator,
  getScheduleValidator,
  getSchedulesValidator,
} from '../validators/schedule'
import {
  createScheduleController,
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

router.post(
  '/:projectId/schedules',
  createScheduleValidator,
  createScheduleController
)

export default router
