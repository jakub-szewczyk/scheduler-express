import { Prisma, Schedule } from '@prisma/client'

export const SCHEDULE: Pick<Schedule, 'title'> = {
  title: 'Schedule #1',
}

export const scheduleSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.ScheduleSelect
