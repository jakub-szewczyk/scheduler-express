import { Prisma, PrismaClient } from '@prisma/client'
import { parseArgs } from 'node:util'
import { boardData } from '../src/modules/board'
import { noteData } from '../src/modules/note'
import { projectData } from '../src/modules/project'
import { scheduleData } from '../src/modules/schedule'

const prismaClient = new PrismaClient()

export const seed = async () => {
  const {
    values: { author: authorId },
  } = parseArgs({ options: { author: { type: 'string', short: 'a' } } })
  if (!authorId)
    throw new Error(
      'The `--author` argument is required. Please provide a valid id of a user whose data you want to seed.'
    )
  await prismaClient.$transaction(
    async (prismaClient) => {
      await prismaClient.project.deleteMany({
        where: {
          authorId: authorId,
        },
      })
      const projects = await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.project.create({
              data: {
                ...projectData({
                  name: `Project #${array.length - index}`,
                  description: null,
                  authorId: authorId,
                }),
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
              },
            })
          ),
      ])
      await Promise.all([
        ...projects.flatMap((project) => [
          ...Array(99)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.schedule.create({
                data: {
                  ...scheduleData({
                    name: `Schedule #${array.length - index + 1}`,
                  }),
                  createdAt: new Date(
                    Date.now() - index + 1 * 1000000
                  ).toISOString(),
                  projectId: project.id,
                },
              })
            ),
          ...Array(99)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.board.create({
                data: {
                  ...boardData({
                    name: `Board #${array.length - index + 1}`,
                  }),
                  createdAt: new Date(
                    Date.now() - index + 1 * 1000000
                  ).toISOString(),
                  projectId: project.id,
                },
              })
            ),
          ...Array(99)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.note.create({
                data: {
                  ...noteData({
                    name: `Note #${array.length - index + 1}`,
                    editorState: Prisma.JsonNull,
                  }),
                  createdAt: new Date(
                    Date.now() - index + 1 * 1000000
                  ).toISOString(),
                  projectId: project.id,
                },
              })
            ),
        ]),
      ])
      return projects
    },
    { timeout: 180000 }
  )
}

// Main
;(async () => {
  try {
    await seed()
    await prismaClient.$disconnect()
  } catch (error) {
    console.error(error)
    await prismaClient.$disconnect()
    process.exit(1)
  }
})()
