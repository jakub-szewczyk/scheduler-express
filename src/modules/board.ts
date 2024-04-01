import { Board, Prisma } from '@prisma/client'

export const BOARD: Pick<Board, 'title' | 'description'> = {
  title: 'Board #1',
  description:
    "Edit your board's title and description. Manage your issues within it.",
}

export const boardSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.BoardSelect
