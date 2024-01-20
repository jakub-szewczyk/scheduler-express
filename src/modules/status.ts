import { Prisma, Status } from '@prisma/client'
import { ISSUES, issuesData } from './issue'

export const STATUSES: Prisma.StatusCreateManyBoardInput[] = [
  { index: 0, title: 'Todo' },
  { index: 1, title: 'On hold' },
  { index: 2, title: 'In progress' },
  { index: 3, title: 'Done' },
]

export const statusData = ({ index, title }: Pick<Status, 'index' | 'title'>) =>
  Prisma.validator<Prisma.StatusCreateWithoutBoardInput>()({
    index,
    title,
    issues: {
      createMany: {
        data: issuesData(ISSUES),
      },
    },
  })

export const statusesData = (statuses: Pick<Status, 'index' | 'title'>[]) =>
  Prisma.validator<Prisma.StatusCreateManyBoardInput[]>()(statuses)
