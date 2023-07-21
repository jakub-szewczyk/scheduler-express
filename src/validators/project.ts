import { body } from 'express-validator'

export const createProjectValidator = [
  body('name', 'You have to give your project a unique name').trim().notEmpty(),
  body('description').trim().notEmpty().optional(),
]
