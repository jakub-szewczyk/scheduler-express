import { body } from 'express-validator'
import { validationMiddleware } from '../middlewares/validation'

export const createPushSubscriptionValidator = [
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
