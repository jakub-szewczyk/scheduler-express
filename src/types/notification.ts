import { Event, Notification } from '@prisma/client'

declare module 'express' {
  interface Request {
    event?: EventStartsAtWithNotificationId
  }
}

export type EventStartsAtWithNotificationId =
  | (Pick<Event, 'startsAt'> & { notification: Pick<Notification, 'id'> })
  | undefined
