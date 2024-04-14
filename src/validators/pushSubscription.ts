import { body, param } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'
import { EventStartsAtWithNotificationId } from '../types/notification'

export const createPushSubscriptionValidator = [
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
      if (!event?.notification) {
        req.statusCode = 404
        throw new Error(
          'A notification for the specified event has not yet been created'
        )
      }
    }),
  body('endpoint')
    .notEmpty()
    .withMessage('Push subscription endpoint is missing')
    .isURL()
    .withMessage('Push subscription endpoint must be a valid url'),
  body('expirationTime')
    .isISO8601()
    .withMessage(
      'Push subscription expiration time must follow the ISO 8601 standard.'
    )
    .optional({ values: 'null' }),
  body('keys')
    .exists()
    .withMessage('Missing push subscription keys')
    .isObject()
    .withMessage('Invalid push subscription keys object'),
  body('keys.p256dh', 'Missing push subscription p256dh key').notEmpty(),
  body('keys.auth', 'Missing push subscription auth key').notEmpty(),
  validationMiddleware,
]
