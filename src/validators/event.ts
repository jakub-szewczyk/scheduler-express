import { param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getEventsValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  param('scheduleId')
    .notEmpty()
    .custom(async (scheduleId: string, { req }) => {
      try {
        await prismaClient.schedule.findFirstOrThrow({
          where: {
            id: scheduleId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        })
      } catch (error) {
        req.statusCode = 404
        throw new Error('Schedule not found')
      }
    }),
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query(
    'createdAt',
    'Invalid value was provided for sorting schedules by creation date'
  )
    .isIn(['ASC', 'DESC'])
    .optional(),
  query('startAt', 'Start date must follow the ISO 8601 standard')
    .isISO8601()
    .optional(),
  query('endAt', 'End date must follow the ISO 8601 standard')
    .isISO8601()
    .optional(),
  validationMiddleware,
]
