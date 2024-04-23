import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma, Status } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { generateRank, statusSelect } from '../modules/status'
import { PaginableResponse } from '../types/pagination'

export type StatusBody = Pick<Status, 'title' | 'description'> & {
  prevStatusId?: string | null
  nextStatusId?: string | null
}

type StatusResponse = Pick<Status, keyof typeof statusSelect>

type GetStatusesControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string },
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
    }
  >
>

type GetStatusesControllerResponse = Response<PaginableResponse<StatusResponse>>

export const getStatusesController = async (
  req: GetStatusesControllerRequest,
  res: GetStatusesControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.StatusWhereInput = {
    ...(req.query.title && {
      title: {
        contains: req.query.title,
        mode: 'insensitive',
      },
    }),
    board: {
      id: req.params.boardId,
      project: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    },
  }
  try {
    const [statuses, total] = await Promise.all([
      prismaClient.status.findMany({
        select: statusSelect,
        where,
        orderBy: { rank: 'asc' },
        take: size,
        skip: page * size,
      }),
      prismaClient.status.count({
        where,
      }),
    ])
    return res.json({
      content: statuses,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type GetStatusControllerRequest = WithAuthProp<
  Request<{ projectId: string; boardId: string; statusId: string }>
>

type GetStatusControllerResponse = Response<StatusResponse>

export const getStatusController = async (
  req: GetStatusControllerRequest,
  res: GetStatusControllerResponse
) => {
  try {
    const status = await prismaClient.status.findUnique({
      select: statusSelect,
      where: {
        id: req.params.statusId,
        board: {
          id: req.params.boardId,
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
      },
    })
    return status ? res.json(status) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateStatusControllerRequest = WithAuthProp<
  Request<{ projectId: string; boardId: string }, object, StatusBody>
>

type CreateStatusControllerResponse = Response<StatusResponse>

export const createStatusController = async (
  req: CreateStatusControllerRequest,
  res: CreateStatusControllerResponse
) => {
  try {
    const status = await prismaClient.status.create({
      select: statusSelect,
      data: {
        title: req.body.title,
        description: req.body.description || null,
        rank: generateRank({
          prevStatusRank: req.prevStatusRank,
          nextStatusRank: req.nextStatusRank,
        }).format(),
        board: {
          connect: {
            id: req.params.boardId,
            project: {
              id: req.params.projectId,
              authorId: req.auth.userId!,
            },
          },
        },
      },
    })
    return res.status(201).json(status)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateStatusControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string; statusId: string },
    object,
    StatusBody
  >
>

type UpdateStatusControllerResponse = Response<StatusResponse>

export const updateStatusController = async (
  req: UpdateStatusControllerRequest,
  res: UpdateStatusControllerResponse
) => {
  try {
    const status = await prismaClient.status.update({
      select: statusSelect,
      where: {
        id: req.params.statusId,
        board: {
          id: req.params.boardId,
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
      },
      data: {
        title: req.body.title,
        description: req.body.description,
        rank: generateRank({
          prevStatusRank: req.prevStatusRank,
          nextStatusRank: req.nextStatusRank,
        }).format(),
      },
    })
    return res.json(status)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
