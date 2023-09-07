import { Router } from 'express'
import {
  createScheduleController,
  getScheduleController,
  getSchedulesController,
  updateScheduleController,
} from '../controllers/schedule'
import {
  createScheduleValidator,
  getScheduleValidator,
  getSchedulesValidator,
  updateScheduleValidator,
} from '../validators/schedule'

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

router.put(
  '/:projectId/schedules/:scheduleId',
  updateScheduleValidator,
  updateScheduleController
)

export default router
