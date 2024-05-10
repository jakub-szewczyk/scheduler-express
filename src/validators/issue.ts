import { Priority } from '@prisma/client'
import { body, param, query } from 'express-validator'
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

const neighborValidation = body(['prevIssueId', 'nextIssueId']).custom(
  async (_, { req }) => {
    if (!req.body.prevIssueId && !req.body.nextIssueId) {
      const firstIssue = await prismaClient.issue.findFirst({
        select: { id: true, rank: true },
        where: {
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
        orderBy: { rank: 'asc' },
      })
      if (firstIssue) req.nextIssueRank = firstIssue.rank
    } else if (req.body.prevIssueId && !req.body.nextIssueId) {
      const lastIssue = await prismaClient.issue.findFirst({
        select: { id: true, rank: true },
        where: {
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
        orderBy: { rank: 'desc' },
      })
      const prevIssue = await prismaClient.issue.findUnique({
        select: { id: true, rank: true },
        where: {
          id: req.body.prevIssueId,
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
      })
      if (!lastIssue || !prevIssue) {
        req.statusCode = 404
        throw new Error('Issue not found')
      }
      if (lastIssue.id !== prevIssue.id)
        throw new Error("Cannot determine issue's position when appending it")
      req.prevIssueRank = prevIssue.rank
    } else if (!req.body.prevIssueId && req.body.nextIssueId) {
      const firstIssue = await prismaClient.issue.findFirst({
        select: { id: true, rank: true },
        where: {
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
        orderBy: { rank: 'asc' },
      })
      const nextIssue = await prismaClient.issue.findUnique({
        select: { id: true, rank: true },
        where: {
          id: req.body.nextIssueId,
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
      })
      if (!firstIssue || !nextIssue) {
        req.statusCode = 404
        throw new Error('Issue not found')
      }
      if (firstIssue.id !== nextIssue.id)
        throw new Error("Cannot determine issue's position when prepending it")
      req.nextIssueRank = nextIssue.rank
    } else {
      const [prevIssue, nextIssue] = await prismaClient.issue.findMany({
        select: { id: true, rank: true },
        where: {
          id: { in: [req.body.prevIssueId, req.body.nextIssueId] },
          status: {
            id: req.body.statusId || req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
      })
      if (!prevIssue || !nextIssue) {
        req.statusCode = 404
        throw new Error('Issue not found')
      }
      if (prevIssue.rank > nextIssue.rank)
        throw new Error(
          "Cannot determine issue's position when putting one in between"
        )
      const issueInBetween = await prismaClient.issue.findFirst({
        select: { id: true },
        where: {
          rank: {
            gt: prevIssue.rank,
            lt: nextIssue.rank,
          },
        },
        orderBy: { rank: 'asc' },
      })
      if (issueInBetween)
        throw new Error(
          "Cannot determine issue's position when putting one in between"
        )
      req.nextIssueRank = nextIssue.rank
      req.prevIssueRank = prevIssue.rank
    }
  }
)

export const createIssueValidator = [
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
  body('title', 'You have to give your issue a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const issue = await prismaClient.issue.findFirst({
        where: {
          title,
          status: {
            id: req.params!.statusId,
            board: {
              id: req.params!.boardId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        },
      })
      if (issue)
        throw new Error(
          'This title has already been used by one of your issues'
        )
    }),
  body('description').trim().optional(),
  body('priority', 'You have to assign your issue a priority')
    .notEmpty()
    .isIn(Object.values(Priority))
    .withMessage("Invalid value was provided for the issue's priority"),
  neighborValidation,
  validationMiddleware,
]

export const updateIssueValidator = [
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
  param('issueId').custom(async (issueId: string, { req }) => {
    const issue = await prismaClient.issue.findFirst({
      where: {
        id: issueId,
        status: {
          id: req.params!.statusId,
          board: {
            id: req.params!.boardId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      },
    })
    if (!issue) {
      req.statusCode = 404
      throw new Error('Issue not found')
    }
    if (
      req.body.prevIssueId &&
      req.body.nextIssueId &&
      (issueId === req.body.prevIssueId || issueId === req.body.nextIssueId)
    )
      throw new Error(
        "Cannot determine issue's position when putting one in between"
      )
    if (
      !req.body.prevIssueId &&
      req.body.nextIssueId &&
      issueId === req.body.nextIssueId
    )
      throw new Error("Cannot determine issue's position when prepending it")
    if (
      req.body.prevIssueId &&
      !req.body.nextIssueId &&
      issueId === req.body.prevStatusId
    )
      throw new Error("Cannot determine issue's position when appending it")
  }),
  body('title', 'You have to give your issue a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const issue = await prismaClient.issue.findFirst({
        where: {
          id: { not: req.params!.issueId },
          title,
          status: {
            id: req.params!.statusId,
            board: {
              id: req.params!.boardId,
              projectId: req.params!.projectId,
            },
          },
        },
      })
      if (issue)
        throw new Error(
          'This title has already been used by one of your issues'
        )
    }),
  body('description').trim().optional(),
  body('priority', 'You have to assign your issue a priority')
    .notEmpty()
    .isIn(Object.values(Priority))
    .withMessage("Invalid value was provided for the issue's priority"),
  body('statusId')
    .custom(async (statusId: string, { req }) => {
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
    })
    .optional(),
  neighborValidation,
  validationMiddleware,
]
