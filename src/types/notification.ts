import { Event, Notification } from '@prisma/client'

export type EventStartsAtWithNotificationId =
  | (Pick<Event, 'startsAt'> & { notification: Pick<Notification, 'id'> })
  | undefined
