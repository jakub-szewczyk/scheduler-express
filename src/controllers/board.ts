import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Board } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'

export const getBoardsController = async (
  req: WithAuthProp<
    Request<
      { projectId: string },
      object,
      object,
      { page?: string; size?: string }
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  const { page, size } = paginationParams(req)
  try {
    const [boards, boardCount] = await Promise.all([
      prismaClient.board.findMany({
        select: {
          id: true,
          createdAt: true,
          name: true,
        },
        where: {
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: size,
        skip: page * size,
      }),
      prismaClient.board.count({
        where: {
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
      }),
    ])
    if (boards.length === 0)
      return res.status(404).json({ message: 'Boards not found' })
    return res.json({
      content: boards,
      page,
      size,
      total: boardCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const getBoardController = async (
  req: WithAuthProp<Request<{ projectId: string; boardId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const board = await prismaClient.board.findUnique({
      select: {
        id: true,
        createdAt: true,
        name: true,
        statuses: {
          select: {
            id: true,
            title: true,
            issues: {
              select: {
                id: true,
                title: true,
                content: true,
              },
              orderBy: { index: 'asc' },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      where: {
        id: req.params.boardId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    if (!board) return res.status(404).json({ message: 'Board not found' })
    return res.json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const createBoardController = async (
  req: WithAuthProp<
    Request<{ projectId: string }, object, Pick<Board, 'name'>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const board = await prismaClient.board.create({
      select: {
        id: true,
        createdAt: true,
        name: true,
        statuses: {
          select: {
            id: true,
            title: true,
            issues: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      data: {
        name: req.body.name,
        projectId: req.params.projectId,
        statuses: {
          create: {
            index: 0,
            title: 'Todo',
            issues: {
              createMany: {
                data: [
                  {
                    index: 0,
                    title: 'Adjust column titles',
                    content:
                      'To rename a status, simply click on the three dots icon next to the status title. This will open the configuration menu, where you can find the option to rename it.',
                  },
                  {
                    index: 1,
                    title: 'Create your own issues',
                    content:
                      'Click on the floating action button in the bottom-right corner of the screen to add more issues',
                  },
                  {
                    index: 2,
                    title: 'Get familiar with the kanban board',
                    content:
                      'Get to know the kanban board. Customize statuses and issues to fit your needs.',
                  },
                ],
              },
            },
          },
          createMany: {
            data: [
              { index: 1, title: 'On hold' },
              { index: 2, title: 'In progress' },
              { index: 3, title: 'Done' },
            ],
          },
        },
      },
    })
    return res.status(201).json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const updateBoardController = async (
  req: WithAuthProp<
    Request<{ projectId: string; boardId: string }, object, { name: string }>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const board = await prismaClient.board.update({
      select: {
        id: true,
        createdAt: true,
        name: true,
        statuses: {
          select: {
            id: true,
            title: true,
            issues: {
              select: {
                id: true,
                title: true,
                content: true,
              },
              orderBy: { index: 'asc' },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      where: {
        id: req.params.boardId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        name: req.body.name,
      },
    })
    return res.json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const deleteBoardController = async (
  req: WithAuthProp<Request<{ projectId: string; boardId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const board = await prismaClient.board.delete({
      select: {
        id: true,
        createdAt: true,
        name: true,
        statuses: {
          select: {
            id: true,
            title: true,
            issues: {
              select: {
                id: true,
                title: true,
                content: true,
              },
              orderBy: { index: 'asc' },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      where: {
        id: req.params.boardId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return res.json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
