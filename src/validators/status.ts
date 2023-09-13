import { PrismaClient } from '@prisma/client'
import { body, param } from 'express-validator'

const prismaClient = new PrismaClient()

export const updateStatusesValidator = [
  param('projectId')
    .notEmpty()
    .custom(async (projectId: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
      if (!project) throw new Error('Project not found')
    }),
  param('boardId')
    .notEmpty()
    .custom(async (boardId: string, { req }) => {
      const board = await prismaClient.board.findUnique({
        where: {
          id: boardId,
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
      if (!board) throw new Error('Board not found')
    }),
  body().isArray().withMessage('Expected payload must be an array'),
]
