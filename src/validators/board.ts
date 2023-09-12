import { param } from 'express-validator'

export const getBoardsValidator = param('projectId').notEmpty()

export const getBoardValidator = [
  param('projectId').notEmpty(),
  param('boardId').notEmpty(),
]
