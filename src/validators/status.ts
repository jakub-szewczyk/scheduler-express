import { Issue, PrismaClient } from '@prisma/client'
import { body, param } from 'express-validator'
import { UpdateStatusRequestBody } from '../controllers/status'

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
  body('*.title')
    .trim()
    .notEmpty()
    .withMessage('You have to give your status a unique title')
    .toLowerCase()
    .custom(async (title: string, { req }) => {
      const titles = (req.body as UpdateStatusRequestBody).map(
        (status) => status.title
      )
      if (titles.indexOf(title) !== titles.lastIndexOf(title))
        throw new Error(
          'This title has already been used by one of your statuses'
        )
    }),
  body('*.issues')
    .isArray()
    .withMessage('Expected field `issues` must be an array'),
  body('*.issues.title')
    .if(
      async (title: Issue['title'], { req, path }) =>
        req.body[path[1]].issue.title
    )
    .trim()
    .notEmpty()
    .withMessage('You have to give your issue a title'),
  body('*.issues.content')
    .if(
      async (content: Issue['content'], { req, path }) =>
        req.body[path[1]].issue.content
    )
    .trim()
    .notEmpty()
    .withMessage('You have to give your issue some content'),
]
