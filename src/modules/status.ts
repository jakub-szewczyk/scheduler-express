import { Prisma, Status } from '@prisma/client'
import { LexoRank } from 'lexorank'

export const STATUS: Pick<Status, 'title' | 'description' | 'rank'> = {
  title: 'Status #1',
  description:
    "Edit your status' title and description. Manage your issues within it.",
  rank: LexoRank.middle().format(),
}

export const RANKS = Array(99)
  .fill(null)
  .reduce(
    (ranks: LexoRank[]) => ranks.concat(ranks.at(-1)!.genNext()),
    [LexoRank.middle()]
  )
  .map((rank) => rank.format())

export const statusSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  rank: true,
} satisfies Prisma.StatusSelect
