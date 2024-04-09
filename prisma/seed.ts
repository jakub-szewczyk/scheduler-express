import { faker } from '@faker-js/faker'
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
      const schedules = await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.schedule.create({
              data: {
                title: `Schedule #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
                projectId: projects[0].id,
              },
            })
          ),
      ])
      const events = await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.event.create({
              data: {
                title: `Event #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
                startsAt: faker.date.recent().toISOString(),
                endsAt: faker.date.soon().toISOString(),
                scheduleId: schedules[0].id,
              },
            })
          ),
      ])
      await prismaClient.notification.create({
        data: {
          title: 'Notification #1',
          startsAt: faker.date.recent().toISOString(),
          eventId: events[0].id,
        },
      })

      /* const boards = */ await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.board.create({
              data: {
                title: `Board #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
                projectId: projects[0].id,
              },
            })
          ),
      ])
      /* const notes = */ await Promise.all([
        ...Array(100)
          .fill(null)
          .map((_, index, array) =>
            prismaClient.note.create({
              data: {
                title: `Note #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
                content: Prisma.JsonNull,
                projectId: projects[0].id,
              },
            })
          ),
      ])
      return projects
    },
    { timeout: 180000 }
  )
}

  // Main
  ; (async () => {
    try {
      await seed()
      await prismaClient.$disconnect()
    } catch (error) {
      console.error(error)
      await prismaClient.$disconnect()
      process.exit(1)
    }
  })()
