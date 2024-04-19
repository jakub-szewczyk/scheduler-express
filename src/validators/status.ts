import { body, param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getStatusesValidator = [
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
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query(
    'createdAt',
    'Invalid value was provided for sorting statuses by creation date'
  )
    .isIn(['ASC', 'DESC'])
    .optional(),
  validationMiddleware,
]

export const getStatusValidator = [
  param('projectId').notEmpty(),
  param('boardId').notEmpty(),
  param('statusId').notEmpty(),
  validationMiddleware,
]

export const createStatusValidator = [
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
  body('title', 'You have to give your status a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const status = await prismaClient.status.findUnique({
        where: {
          title_boardId: {
            title,
            boardId: req.params!.boardId,
          },
        },
      })
      if (status)
        throw new Error(
          'This title has already been used by one of your statuses'
        )
    }),
  body('description').trim().optional(),
  body(['prevStatusId', 'nextStatusId']).custom(async (_, { req }) => {
    if (!req.body.prevStatusId && !req.body.nextStatusId)
      throw new Error("Cannot determine status' position")
  }),
  body('prevStatusId')
    .custom(async (prevStatusId: string, { req }) => {
      const prevStatus = await prismaClient.status.findUnique({
        select: { rank: true },
        where: { id: prevStatusId },
      })
      if (!prevStatus) {
        req.statusCode = 404
        throw new Error('Status not found')
      }
      req.prevStatusRank = prevStatus.rank
    })
    .optional(),
  body('nextStatusId')
    .custom(async (nextStatusId: string, { req }) => {
      const nextStatus = await prismaClient.status.findUnique({
        select: { rank: true },
        where: { id: nextStatusId },
      })
      if (!nextStatus) {
        req.statusCode = 404
        throw new Error('Status not found')
      }
      req.nextStatusRank = nextStatus.rank
    })
    .optional(),
  validationMiddleware,
]
