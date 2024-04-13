import { Prisma } from '@prisma/client'

export const pushSubscriptionSelect = {
  id: true,
  createdAt: true,
  entity: true,
} satisfies Prisma.PushSubscriptionSelect
