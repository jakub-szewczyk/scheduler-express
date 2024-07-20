import { Event, Prisma } from '@prisma/client'

export const EVENT: Pick<
  Event,
  'title' | 'description' | 'startsAt' | 'endsAt'
> = {
  title: 'Event #1',
  description:
    "Edit your event's title and description. Manage your notification within it.",
  startsAt: new Date('2024-04-02T14:25:54.183Z'),
  endsAt: new Date('2024-04-02T18:23:04.809Z'),
}

export const eventSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
  color: true,
} satisfies Prisma.EventSelect
