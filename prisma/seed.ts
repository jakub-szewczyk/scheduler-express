import { Prisma, PrismaClient } from '@prisma/client'
import { parseArgs } from 'node:util'

const prismaClient = new PrismaClient()

const seed = async () => {
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
          authorId,
        },
      })
      const projects = await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.project.create({
              data: {
                title: `Project #${array.length - index}`,
                description: null,
                authorId,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
              },
            })
          ),
      ])
      await Promise.all([
        ...projects.flatMap((project) => [
          ...Array(100)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.schedule.create({
                data: {
                  title: `Schedule #${array.length - index}`,
                  createdAt: new Date(
                    Date.now() - index * 1000000
                  ).toISOString(),
                  projectId: project.id,
                },
              })
            ),
          ...Array(100)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.board.create({
                data: {
                  title: `Board #${array.length - index}`,
                  createdAt: new Date(
                    Date.now() - index * 1000000
                  ).toISOString(),
                  projectId: project.id,
                },
              })
            ),
          ...Array(100)
            .fill(null)
            .map((_, index, array) =>
              prismaClient.note.create({
                data: {
                  title: `Note #${array.length - index}`,
                  content: Prisma.JsonNull,
                  createdAt: new Date(
                    Date.now() - index * 1000000
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
