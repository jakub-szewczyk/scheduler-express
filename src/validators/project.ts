import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'

const prismaClient = new PrismaClient()

export const createProjectValidator = [
  body('name', 'You have to give your project a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string) => {
      const count = await prismaClient.project.count({
        where: {
          name,
        },
      })
      if (count > 0)
        throw new Error(
          'This name has already been used by one of your projects'
        )
    }),
  body('description').trim().notEmpty().optional(),
]
