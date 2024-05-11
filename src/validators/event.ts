import { body, param, query } from 'express-validator'
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
  param('scheduleId').custom(async (scheduleId: string, { req }) => {
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
    'Invalid value was provided for sorting events by creation date'
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

export const getEventValidator = [
  param('projectId').notEmpty(),
  param('scheduleId').notEmpty(),
  param('eventId').notEmpty(),
  validationMiddleware,
]

export const createEventValidator = [
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
  param('scheduleId').custom(async (scheduleId: string, { req }) => {
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
  body('title', 'You have to give your event a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const event = await prismaClient.event.findUnique({
        where: {
          title_scheduleId: {
            title,
            scheduleId: req.params!.scheduleId,
          },
        },
      })
      if (event)
        throw new Error(
          'This title has already been used by one of your events'
        )
    }),
  body('description').trim().optional(),
  body('startsAt')
    .notEmpty()
    .withMessage('You have to assign a start date to your event')
    .isISO8601()
    .withMessage('Start date must follow the ISO 8601 standard'),
  body('endsAt')
    .notEmpty()
    .withMessage('You have to assign an end date to your event')
    .isISO8601()
    .withMessage('End date must follow the ISO 8601 standard')
    .custom(async (endsAt: string, { req }) => {
      if (new Date(endsAt).getTime() < new Date(req.body.startsAt).getTime())
        throw new Error('End date cannot precede the start date')
    }),
  validationMiddleware,
]

export const updateEventValidator = [
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
  param('scheduleId').custom(async (scheduleId: string, { req }) => {
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
  param('eventId').custom(async (eventId: string, { req }) => {
    try {
      await prismaClient.event.findFirstOrThrow({
        where: {
          id: eventId,
          schedule: {
            id: req.params!.scheduleId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Event not found')
    }
  }),
  body('title', 'You have to give your event a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const event = await prismaClient.event.findFirst({
        where: {
          id: { not: req.params!.eventId },
          title,
          schedule: {
            id: req.params!.scheduleId,
            projectId: req.params!.projectId,
          },
        },
      })
      if (event)
        throw new Error(
          'This title has already been used by one of your events'
        )
    }),
  body('description').trim().optional(),
  body('startsAt')
    .notEmpty()
    .withMessage('You have to assign a start date to your event')
    .isISO8601()
    .withMessage('Start date must follow the ISO 8601 standard'),
  body('endsAt')
    .notEmpty()
    .withMessage('You have to assign an end date to your event')
    .isISO8601()
    .withMessage('End date must follow the ISO 8601 standard')
    .custom(async (endsAt: string, { req }) => {
      if (new Date(endsAt).getTime() < new Date(req.body.startsAt).getTime())
        throw new Error('End date cannot precede the start date')
    }),
  validationMiddleware,
]

export const deleteEventValidator = [
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
  param('scheduleId').custom(async (scheduleId: string, { req }) => {
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
  param('eventId').custom(async (eventId: string, { req }) => {
    try {
      await prismaClient.event.findFirstOrThrow({
        where: {
          id: eventId,
          schedule: {
            id: req.params!.scheduleId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Event not found')
    }
  }),
  validationMiddleware,
]
