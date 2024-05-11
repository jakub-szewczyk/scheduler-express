import { Prisma, Project } from '@prisma/client'

export const PROJECT: Pick<Project, 'title' | 'description'> = {
  title: 'Project #1',
  description:
    "Edit your project's title and description. Manage your notes, boards and schedules within it.",
}

export const projectSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.ProjectSelect
