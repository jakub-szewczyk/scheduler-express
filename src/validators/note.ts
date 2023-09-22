import { param } from 'express-validator'

export const getNotesValidator = param('projectId').notEmpty()
