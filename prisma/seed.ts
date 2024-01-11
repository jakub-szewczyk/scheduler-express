import { PrismaClient } from '@prisma/client'
import { projectData } from '../src/modules/project'

const prismaClient = new PrismaClient()

const AUTHOR_ID = 'user_2SSSUbIMbeNiV2lmsG6PfLQcjJM'

const seed = async () => {
  await prismaClient.$transaction([
    prismaClient.project.deleteMany({
      where: {
        authorId: AUTHOR_ID,
      },
    }),
    ...Array(20)
      .fill(null)
      .map((_, index, array) =>
        prismaClient.project.create({
          data: {
            ...projectData({
              name: `Project #${array.length - index}`,
              description: null,
              authorId: AUTHOR_ID,
            }),
            createdAt: new Date(Date.now() - index * 1000000).toISOString(),
          },
        })
      ),
  ])
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
