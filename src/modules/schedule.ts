import { Prisma, Schedule } from '@prisma/client'
import { ROWS, rowsData } from './row'

export const SCHEDULE: Prisma.ScheduleCreateWithoutProjectInput = {
  name: 'Schedule #1',
}

export const scheduleData = ({ name }: Pick<Schedule, 'name'>) =>
  Prisma.validator<Prisma.ScheduleCreateWithoutProjectInput>()({
    name,
    rows: {
      createMany: {
        data: rowsData(ROWS),
      },
    },
  })
