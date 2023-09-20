import { body, param } from 'express-validator'
import prismaClient from '../../prisma/client'

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

export const updateBoardValidator = [
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
  body('name', 'You have to give your board a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const board = await prismaClient.board.findUnique({
        where: {
          AND: [
            { id: { not: req.params!.boardId } },
            { name, projectId: req.params!.projectId },
          ],
          name_projectId: { name, projectId: req.params!.projectId },
        },
      })
      if (board)
        throw new Error('This name has already been used by one of your boards')
    }),
]

export const deleteBoardValidator = [
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
    })
    .custom(async (boardId: string, { req }) => {
      const boardCount = await prismaClient.board.count({
        where: {
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
      if (boardCount === 1) throw new Error('At least one board is required')
    }),
]
