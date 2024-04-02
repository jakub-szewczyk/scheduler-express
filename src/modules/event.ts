import { Prisma } from '@prisma/client'

export const eventSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
} satisfies Prisma.EventSelect
