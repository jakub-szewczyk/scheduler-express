import { Prisma, Project } from '@prisma/client'

export const PROJECT: Pick<Project, 'name' | 'description'> = {
  name: 'Project #1',
  description:
    "Edit your project's title and description. Manage your notes, boards and schedules within it.",
}

export const projectSelect: Prisma.ProjectSelect = {
  id: true,
  createdAt: true,
  name: true,
  description: true,
}

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
      create: {
        name: 'Schedule #1',
        rows: {
          createMany: {
            data: [
              { day: 'Monday', index: 0 },
              { day: 'Tuesday', index: 1 },
              { day: 'Wednesday', index: 2 },
              { day: 'Thursday', index: 3 },
              { day: 'Friday', index: 4 },
            ],
          },
        },
      },
    },
    boards: {
      create: {
        name: 'Board #1',
        statuses: {
          create: {
            index: 0,
            title: 'Todo',
            issues: {
              createMany: {
                data: [
                  {
                    index: 0,
                    title: 'Adjust column titles',
                    content:
                      'To rename a status, simply click on the three dots icon next to the status title. This will open the configuration menu, where you can find the option to rename it.',
                  },
                  {
                    index: 1,
                    title: 'Create your own issues',
                    content:
                      'Click on the floating action button in the bottom-right corner of the screen to add more issues',
                  },
                  {
                    index: 2,
                    title: 'Get familiar with the kanban board',
                    content:
                      'Get to know the kanban board. Customize statuses and issues to fit your needs.',
                  },
                ],
              },
            },
          },
          createMany: {
            data: [
              { index: 1, title: 'On hold' },
              { index: 2, title: 'In progress' },
              { index: 3, title: 'Done' },
            ],
          },
        },
      },
    },
    notes: {
      create: {
        name: 'Note #1',
        editorState: Prisma.JsonNull,
      },
    },
  })
