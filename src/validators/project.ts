import { body, param } from 'express-validator'
import prismaClient from '../../prisma/client'

export const createProjectValidator = [
  body('name', 'You have to give your project a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          name_authorId: {
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
        throw new Error('Project not found')
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

export const deleteProjectValidator = param('projectId')
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
      throw new Error('Project not found')
    }
  })
  .custom(async (projectId: string, { req }) => {
    const projectCount = await prismaClient.project.count({
      where: {
        authorId: req.auth.userId,
      },
    })
    if (projectCount === 1) throw new Error('At least one project is required')
  })
