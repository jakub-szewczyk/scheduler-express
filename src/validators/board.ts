import { param } from 'express-validator'

export const getBoardsValidator = param('projectId').notEmpty()
