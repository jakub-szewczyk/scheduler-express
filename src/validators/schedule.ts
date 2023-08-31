import { param } from 'express-validator'

export const getSchedulesValidator = param('projectId').notEmpty()

export const getScheduleValidator = param('scheduleId').notEmpty()
