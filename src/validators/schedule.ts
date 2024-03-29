import { body, param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getSchedulesValidator = [
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
  validationMiddleware,
]

export const getScheduleValidator = [
  param('projectId').notEmpty(),
  param('scheduleId').notEmpty(),
  validationMiddleware,
]

export const createScheduleValidator = [
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
  body('title', 'You have to give your schedule a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const schedule = await prismaClient.schedule.findUnique({
        where: {
          title_projectId: {
            title,
            projectId: req.params!.projectId,
          },
        },
      })
      if (schedule)
        throw new Error(
          'This title has already been used by one of your schedules'
        )
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const updateScheduleValidator = [
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
  body('title', 'You have to give your schedule a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const schedule = await prismaClient.schedule.findFirst({
        where: {
          id: { not: req.params!.scheduleId },
          title,
          projectId: req.params!.projectId,
        },
      })
      if (schedule)
        throw new Error(
          'This title has already been used by one of your schedules'
        )
    }),
  body('description').trim().optional(),
]

export const deleteScheduleValidator = [
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
  validationMiddleware,
]
