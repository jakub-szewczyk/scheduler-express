import { param } from 'express-validator'

export const getNotesValidator = param('projectId').notEmpty()

export const getNoteValidator = [
  param('projectId').notEmpty(),
  param('noteId').notEmpty(),
]
