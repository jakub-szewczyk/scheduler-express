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

type GetEventControllerRequest = WithAuthProp<
  Request<{ projectId: string; scheduleId: string; eventId: string }>
>

type GetEventControllerResponse = Response<EventResponse>

export const getEventController = async (
  req: GetEventControllerRequest,
  res: GetEventControllerResponse
) => {
  try {
    const event = await prismaClient.event.findUnique({
      select: eventSelect,
      where: {
        id: req.params.eventId,
        schedule: {
          id: req.params.scheduleId,
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
      },
    })
    return event ? res.json(event) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateEventControllerRequest = WithAuthProp<
  Request<
    { projectId: string; scheduleId: string },
    object,
    Pick<Event, 'title' | 'description' | 'startsAt' | 'endsAt'>
  >
>

type CreateEventControllerResponse = Response<EventResponse>

export const createEventController = async (
  req: CreateEventControllerRequest,
  res: CreateEventControllerResponse
) => {
  try {
    const event = await prismaClient.event.create({
      select: eventSelect,
      data: {
        title: req.body.title,
        description: req.body.description,
        startsAt: req.body.startsAt,
        endsAt: req.body.endsAt,
        schedule: {
          connect: {
            id: req.params.scheduleId,
            project: {
              id: req.params.projectId,
              authorId: req.auth.userId!,
            },
          },
        },
      },
    })
    return res.status(201).json(event)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
