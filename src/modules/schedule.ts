import { Prisma, Schedule } from '@prisma/client'

export const SCHEDULE: Pick<Schedule, 'title' | 'description'> = {
  title: 'Schedule #1',
  description:
    "Edit your schedule's title and description. Manage your events within it.",
}

export const scheduleSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.ScheduleSelect
