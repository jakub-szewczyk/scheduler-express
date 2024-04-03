import { Event, Prisma } from '@prisma/client'

export const EVENT: Pick<Event, 'title' | 'description'> = {
  title: 'Event #1',
  description:
    "Edit your event's title and description. Manage your notification within it.",
}

export const eventSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
} satisfies Prisma.EventSelect
