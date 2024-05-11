import { Prisma, Status } from '@prisma/client'
import { LexoRank } from 'lexorank'

export const STATUS: Pick<Status, 'title' | 'description' | 'rank'> = {
  title: 'Status #1',
  description:
    "Edit your status' title and description. Manage your issues within it.",
  rank: LexoRank.middle().format(),
}

export const statusSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.StatusSelect
