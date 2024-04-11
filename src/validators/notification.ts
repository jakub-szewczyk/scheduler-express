import { body, param } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'
import { EventStartsAtWithNotificationId } from '../types/notification'

export const getNotificationValidator = [
  param('projectId').notEmpty(),
  param('scheduleId').notEmpty(),
  param('eventId').notEmpty(),
  validationMiddleware,
]

export const createNotificationValidator = [
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
  param('eventId')
    .custom(async (eventId: string, { req }) => {
      try {
        const event = await prismaClient.event.findFirstOrThrow({
          select: { startsAt: true, notification: { select: { id: true } } },
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
        req.event = event
      } catch (error) {
        req.statusCode = 404
        throw new Error('Event not found')
      }
    })
    .custom(async (_, { req }) => {
      const event = req.event as EventStartsAtWithNotificationId
      if (event?.notification)
        throw new Error(
          'A notification for the specified event has already been created'
        )
    }),
  body('title', 'You have to give your notification a title').trim().notEmpty(),
  body('description').trim().optional(),
  body('startsAt')
    .notEmpty()
    .withMessage('You have to assign a start date to your notification')
    .isISO8601()
    .withMessage('Start date must follow the ISO 8601 standard')
    .custom(async (startsAt: string, { req }) => {
      const event = req.event as EventStartsAtWithNotificationId
      if (
        event &&
        new Date(startsAt).getTime() > new Date(event.startsAt).getTime()
      )
        throw new Error(
          "Notification's start time cannot exceed the start time of the event"
        )
    }),
  body(
    'isActive',
    'Invalid value was provided for setting the initial active state'
  )
    .isBoolean()
    .optional(),
  validationMiddleware,
]

export const updateNotificationValidator = [
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
  param('eventId')
    .custom(async (eventId: string, { req }) => {
      try {
        const event = await prismaClient.event.findFirstOrThrow({
          select: { startsAt: true, notification: { select: { id: true } } },
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
        req.event = event
      } catch (error) {
        req.statusCode = 404
        throw new Error('Event not found')
      }
    })
    .custom(async (_, { req }) => {
      const event = req.event as EventStartsAtWithNotificationId
      if (!event?.notification)
        throw new Error(
          'A notification for the specified event has not yet been created'
        )
    }),
  body('title', 'You have to give your notification a title').trim().notEmpty(),
  body('description').trim().optional(),
  body('startsAt')
    .notEmpty()
    .withMessage('You have to assign a start date to your notification')
    .isISO8601()
    .withMessage('Start date must follow the ISO 8601 standard')
    .custom(async (startsAt: string, { req }) => {
      const event = req.event as EventStartsAtWithNotificationId
      if (
        event &&
        new Date(startsAt).getTime() > new Date(event.startsAt).getTime()
      )
        throw new Error(
          "Notification's start time cannot exceed the start time of the event"
        )
    }),
  body(
    'isActive',
    'Invalid value was provided for setting the initial active state'
  )
    .isBoolean()
    .optional(),
  validationMiddleware,
]
