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

export const getProjectValidator = [
  param('projectId').notEmpty(),
  validationMiddleware,
]

export const createProjectValidator = [
  body('title', 'You have to give your project a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          title_authorId: {
            title,
            authorId: req.auth.userId,
          },
        },
      })
      if (project)
        throw new Error(
          'This title has already been used by one of your projects'
        )
    }),
  body('description').trim().optional(),
  validationMiddleware,
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
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  body('title', 'You have to give your project a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const project = await prismaClient.project.findFirst({
        where: {
          id: { not: req.params!.projectId },
          title,
          authorId: req.auth.userId,
        },
      })
      if (project)
        throw new Error(
          'This title has already been used by one of your projects'
        )
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const deleteProjectValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  validationMiddleware,
]
