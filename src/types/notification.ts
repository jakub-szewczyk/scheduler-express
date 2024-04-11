import { Event, Notification } from '@prisma/client'

declare module 'express' {
  interface Request {
    event?: EventStartsAtWithNotificationId & { notification: { id: string } }
  }
}

export type EventStartsAtWithNotificationId =
  | (Pick<Event, 'startsAt'> & {
      notification: Pick<Notification, 'id'>
    })
  | undefined
