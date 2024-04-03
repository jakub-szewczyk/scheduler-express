import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Event, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { eventSelect } from '../modules/event'
import { paginationParams } from '../modules/pagination'
import { PaginableResponse } from '../types/pagination'

type EventResponse = Pick<Event, keyof typeof eventSelect>

type GetEventsControllerRequest = WithAuthProp<
  Request<
    { projectId: string; scheduleId: string },
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
      createdAt?: 'ASC' | 'DESC'
      startAt?: string
      endAt?: string
    }
  >
>

type GetEventsControllerResponse = Response<PaginableResponse<EventResponse>>

export const getEventsController = async (
  req: GetEventsControllerRequest,
  res: GetEventsControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.EventWhereInput = {
    ...(req.query.title && {
      title: {
        contains: req.query.title,
        mode: 'insensitive',
      },
    }),
    ...(req.query.startAt && {
      startsAt: {
        gte: req.query.startAt,
      },
    }),
    ...(req.query.endAt && {
      endsAt: {
        lte: req.query.endAt,
      },
    }),
    schedule: {
      id: req.params.scheduleId,
      project: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    },
  }
  try {
    const [events, total] = await Promise.all([
      prismaClient.event.findMany({
        select: eventSelect,
        where,
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
        take: size,
        skip: page * size,
      }),
      prismaClient.event.count({
        where,
      }),
    ])
    return res.json({
      content: events,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
