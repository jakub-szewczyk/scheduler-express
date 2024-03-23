import { Prisma, Project } from '@prisma/client'
import { BOARD, boardData } from './board'
import { NOTE, noteData } from './note'
import { SCHEDULE, scheduleData } from './schedule'

export const PROJECT: Pick<Project, 'name' | 'description'> = {
  name: 'Project #1',
  description:
    "Edit your project's title and description. Manage your notes, boards and schedules within it.",
}

export const projectSelect = {
  id: true,
  createdAt: true,
  name: true,
  description: true,
} satisfies Prisma.ProjectSelect

export const projectData = ({
  name,
  description,
  authorId,
}: Pick<Project, 'name' | 'description' | 'authorId'>) =>
  Prisma.validator<Prisma.ProjectCreateInput>()({
    name,
    description,
    authorId,
    schedules: {
      create: scheduleData(SCHEDULE),
    },
    boards: {
      create: boardData(BOARD),
    },
    notes: {
      create: noteData(NOTE),
    },
  })
