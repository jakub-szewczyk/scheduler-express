import { body, param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getProjectsValidator = [
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query(
    'createdAt',
    'Invalid value was provided for sorting projects by creation date'
  )
    .isIn(['ASC', 'DESC'])
    .optional(),
  validationMiddleware,
]

export const getProjectValidator = param('projectId').notEmpty()

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
  param('projectId').custom(async (projectId: string, { req }) => {
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
          id: { not: req.params!.projectId },
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
  .custom(async (_, { req }) => {
    const projectCount = await prismaClient.project.count({
      where: {
        authorId: req.auth.userId,
      },
    })
    if (projectCount === 1) throw new Error('At least one project is required')
  })
