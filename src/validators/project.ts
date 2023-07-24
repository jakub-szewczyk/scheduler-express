import { PrismaClient } from '@prisma/client'
import { body, param } from 'express-validator'

const prismaClient = new PrismaClient()

export const createProjectValidator = [
  body('name', 'You have to give your project a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          authorId_name: {
            name,
            authorId: req.auth.userId,
          },
        },
      })
      if (project)
        throw new Error(
          'This name has already been used by one of your projects'
        )
    }),
  body('description').trim().optional(),
]

export const updateProjectValidator = [
  param('projectId')
    .notEmpty()
    .custom(async (projectId: string, { req }) => {
      try {
        await prismaClient.project.findUniqueOrThrow({
          where: {
            id: projectId,
            authorId: req.auth.userId,
          },
        })
      } catch (error) {
        throw new Error("Cannot update a project that doesn't exist")
      }
    }),
  body('name', 'You have to give your project a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const project = await prismaClient.project.findFirst({
        where: {
          id: { not: req.params?.projectId },
          name,
          authorId: req.auth.userId,
        },
      })
      if (project)
        throw new Error(
          'This name has already been used by one of your projects'
        )
    }),
  body('description').trim().optional(),
]
