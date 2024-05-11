import { body, param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getBoardsValidator = [
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
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query(
    'createdAt',
    'Invalid value was provided for sorting boards by creation date'
  )
    .isIn(['ASC', 'DESC'])
    .optional(),
  validationMiddleware,
]

export const getBoardValidator = [
  param('projectId').notEmpty(),
  param('boardId').notEmpty(),
  validationMiddleware,
]

export const createBoardValidator = [
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
  body('title', 'You have to give your board a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const board = await prismaClient.board.findUnique({
        where: {
          title_projectId: {
            title,
            projectId: req.params!.projectId,
          },
        },
      })
      if (board)
        throw new Error(
          'This title has already been used by one of your boards'
        )
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const updateBoardValidator = [
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
  param('boardId').custom(async (boardId: string, { req }) => {
    try {
      await prismaClient.board.findFirstOrThrow({
        where: {
          id: boardId,
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Board not found')
    }
  }),
  body('title', 'You have to give your board a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const board = await prismaClient.board.findFirst({
        where: {
          id: { not: req.params!.boardId },
          title,
          projectId: req.params!.projectId,
        },
      })
      if (board)
        throw new Error(
          'This title has already been used by one of your boards'
        )
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const deleteBoardValidator = [
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
  param('boardId').custom(async (boardId: string, { req }) => {
    try {
      await prismaClient.board.findFirstOrThrow({
        where: {
          id: boardId,
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Board not found')
    }
  }),
  validationMiddleware,
]
