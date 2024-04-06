import { Notification, Prisma } from '@prisma/client'

export const NOTIFICATION: Pick<
  Notification,
  'title' | 'description' | 'startsAt' | 'isActive'
> = {
  title: 'Notification #1',
  description:
    "Edit your notification's details. By subscribing to it, you'll receive reminders about your events.",
  startsAt: new Date('2024-04-02T14:25:54.183Z'),
  isActive: true,
}

export const notificationSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  startsAt: true,
  isActive: true,
} satisfies Prisma.NotificationSelect
