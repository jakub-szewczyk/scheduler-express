import { param } from 'express-validator'
import { validationMiddleware } from '../middlewares/validation'

export const getNotificationValidator = [
  param('projectId').notEmpty(),
  param('scheduleId').notEmpty(),
  param('eventId').notEmpty(),
  validationMiddleware,
]
