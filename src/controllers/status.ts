import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma, Status } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { statusSelect } from '../modules/status'
import { PaginableResponse } from '../types/pagination'

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
      createdAt?: 'ASC' | 'DESC'
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
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
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
