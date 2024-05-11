import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Board, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { boardSelect } from '../modules/board'
import { paginationParams } from '../modules/pagination'
import { PaginableResponse } from '../types/pagination'

type BoardResponse = Pick<Board, keyof typeof boardSelect>

type GetBoardsControllerRequest = WithAuthProp<
  Request<
    { projectId: string },
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
      createdAt?: 'ASC' | 'DESC'
    }
  >
>

type GetBoardsControllerResponse = Response<PaginableResponse<BoardResponse>>

export const getBoardsController = async (
  req: GetBoardsControllerRequest,
  res: GetBoardsControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.BoardWhereInput = {
    ...(req.query.title && {
      title: {
        contains: req.query.title,
        mode: 'insensitive',
      },
    }),
    project: {
      id: req.params.projectId,
      authorId: req.auth.userId!,
    },
  }
  try {
    const [boards, total] = await Promise.all([
      prismaClient.board.findMany({
        select: boardSelect,
        where,
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
        take: size,
        skip: page * size,
      }),
      prismaClient.board.count({
        where,
      }),
    ])
    return res.json({
      content: boards,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type GetBoardControllerRequest = WithAuthProp<
  Request<{ projectId: string; boardId: string }>
>

type GetBoardControllerResponse = Response<BoardResponse>

export const getBoardController = async (
  req: GetBoardControllerRequest,
  res: GetBoardControllerResponse
) => {
  try {
    const board = await prismaClient.board.findUnique({
      select: boardSelect,
      where: {
        id: req.params.boardId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return board ? res.json(board) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateBoardControllerRequest = WithAuthProp<
  Request<{ projectId: string }, object, Pick<Board, 'title' | 'description'>>
>

type CreateBoardControllerResponse = Response<BoardResponse>

export const createBoardController = async (
  req: CreateBoardControllerRequest,
  res: CreateBoardControllerResponse
) => {
  try {
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: req.body.title,
        description: req.body.description || null,
        projectId: req.params.projectId,
      },
    })
    return res.status(201).json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateBoardControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string },
    object,
    Pick<Board, 'title' | 'description'>
  >
>

type UpdateBoardControllerResponse = Response<BoardResponse>

export const updateBoardController = async (
  req: UpdateBoardControllerRequest,
  res: UpdateBoardControllerResponse
) => {
  try {
    const board = await prismaClient.board.update({
      select: boardSelect,
      where: {
        id: req.params.boardId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        title: req.body.title,
        description: req.body.description,
      },
    })
    return res.json(board)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type DeleteBoardControllerRequest = WithAuthProp<
  Request<{ projectId: string; boardId: string }>
>

type DeleteBoardControllerResponse = Response<BoardResponse>

export const deleteBoardController = async (
  req: DeleteBoardControllerRequest,
  res: DeleteBoardControllerResponse
) => {
  try {
    const board = await prismaClient.board.delete({
      select: boardSelect,
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
