import { PrismaClient } from '@prisma/client'
import { body, param } from 'express-validator'

const prismaClient = new PrismaClient()

export const getBoardsValidator = param('projectId').notEmpty()

export const getBoardValidator = [
  param('projectId').notEmpty(),
  param('boardId').notEmpty(),
]

export const createBoardValidator = [
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
  body('name', 'You have to give your board a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const board = await prismaClient.board.findUnique({
        where: {
          name_projectId: {
            name,
            projectId: req.params!.projectId,
          },
        },
      })
      if (board)
        throw new Error('This name has already been used by one of your boards')
    }),
]
