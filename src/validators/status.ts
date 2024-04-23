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
    if (!req.body.prevStatusId && !req.body.nextStatusId) {
      const firstStatus = await prismaClient.status.findFirst({
        select: { id: true, rank: true },
        where: {
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
        orderBy: { rank: 'asc' },
      })
      if (firstStatus) req.nextStatusRank = firstStatus.rank
    } else if (req.body.prevStatusId && !req.body.nextStatusId) {
      const lastStatus = await prismaClient.status.findFirst({
        select: { id: true, rank: true },
        where: {
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
        orderBy: { rank: 'desc' },
      })
      const prevStatus = await prismaClient.status.findUnique({
        select: { id: true, rank: true },
        where: {
          id: req.body.prevStatusId,
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
      if (!lastStatus || !prevStatus) {
        req.statusCode = 404
        throw new Error('Status not found')
      }
      if (lastStatus.id !== prevStatus.id)
        throw new Error("Cannot determine status' position when appending it")
      req.prevStatusRank = prevStatus.rank
    } else if (!req.body.prevStatusId && req.body.nextStatusId) {
      const firstStatus = await prismaClient.status.findFirst({
        select: { id: true, rank: true },
        where: {
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
        orderBy: { rank: 'asc' },
      })
      const nextStatus = await prismaClient.status.findUnique({
        select: { id: true, rank: true },
        where: {
          id: req.body.nextStatusId,
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
      if (!firstStatus || !nextStatus) {
        req.statusCode = 404
        throw new Error('Status not found')
      }
      if (firstStatus.id !== nextStatus.id)
        throw new Error("Cannot determine status' position when prepending it")
      req.nextStatusRank = nextStatus.rank
    } else {
      const [prevStatus, nextStatus] = await prismaClient.status.findMany({
        select: { id: true, rank: true },
        where: {
          id: { in: [req.body.prevStatusId, req.body.nextStatusId] },
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
      if (!prevStatus || !nextStatus) {
        req.statusCode = 404
        throw new Error('Status not found')
      }
      if (prevStatus.rank > nextStatus.rank)
        throw new Error(
          "Cannot determine status' position when putting one in between"
        )
      const statusInBetween = await prismaClient.status.findFirst({
        select: { id: true },
        where: {
          rank: {
            gt: prevStatus.rank,
            lt: nextStatus.rank,
          },
        },
        orderBy: { rank: 'asc' },
      })
      if (statusInBetween)
        throw new Error(
          "Cannot determine status' position when putting one in between"
        )
      req.nextStatusRank = nextStatus.rank
      req.prevStatusRank = prevStatus.rank
    }
  }),
  validationMiddleware,
]

export const updateStatusValidator = [
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
  body('title', 'You have to give your status a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const status = await prismaClient.status.findFirst({
        where: {
          id: { not: req.params!.statusId },
          title,
          board: {
            id: req.params!.boardId,
            projectId: req.params!.projectId,
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
