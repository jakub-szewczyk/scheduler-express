import { Board, Prisma } from '@prisma/client'
import { STATUSES, statusData, statusesData } from './status'

export const BOARD: Prisma.BoardCreateWithoutProjectInput = { name: 'Board #1' }

export const boardData = ({ name }: Pick<Board, 'name'>) =>
  Prisma.validator<Prisma.BoardCreateWithoutProjectInput>()({
    name,
    statuses: {
      create: statusData(STATUSES[0]),
      createMany: {
        data: statusesData(STATUSES.slice(1)),
      },
    },
  })
