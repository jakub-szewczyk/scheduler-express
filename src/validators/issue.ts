import { param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getIssuesValidator = [
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
  param('statusId').custom(async (statusId: string, { req }) => {
    try {
      await prismaClient.status.findFirstOrThrow({
        where: {
          id: statusId,
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Status not found')
    }
  }),
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  validationMiddleware,
]

export const getIssueValidator = [
  param('projectId').notEmpty(),
  param('boardId').notEmpty(),
  param('issueId').notEmpty(),
  validationMiddleware,
]
