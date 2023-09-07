import { Router } from 'express'
import {
  createScheduleController,
  deleteScheduleController,
  getScheduleController,
  getSchedulesController,
  updateScheduleController,
} from '../controllers/schedule'
import {
  createScheduleValidator,
  deleteScheduleValidator,
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

router.delete(
  '/:projectId/schedules/:scheduleId',
  deleteScheduleValidator,
  deleteScheduleController
)

export default router
