import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma, Schedule } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { scheduleSelect } from '../modules/schedule'
import { PaginableResponse } from '../types/pagination'

type ScheduleResponse = Pick<Schedule, keyof typeof scheduleSelect>

type GetSchedulesControllerRequest = WithAuthProp<
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

type GetSchedulesControllerResponse = Response<
  PaginableResponse<ScheduleResponse>
>

export const getSchedulesController = async (
  req: GetSchedulesControllerRequest,
  res: GetSchedulesControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.ScheduleWhereInput = {
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
    const [schedules, total] = await Promise.all([
      prismaClient.schedule.findMany({
        select: scheduleSelect,
        where,
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
        take: size,
        skip: page * size,
      }),
      prismaClient.schedule.count({
        where,
      }),
    ])
    return res.json({
      content: schedules,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type GetScheduleControllerRequest = WithAuthProp<
  Request<{ projectId: string; scheduleId: string }>
>

type GetScheduleControllerResponse = Response<ScheduleResponse>

export const getScheduleController = async (
  req: GetScheduleControllerRequest,
  res: GetScheduleControllerResponse
) => {
  try {
    const schedule = await prismaClient.schedule.findUnique({
      select: scheduleSelect,
      where: {
        id: req.params.scheduleId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return schedule ? res.json(schedule) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateScheduleControllerRequest = WithAuthProp<
  Request<
    { projectId: string },
    object,
    Pick<Schedule, 'title' | 'description'>
  >
>

type CreateScheduleControllerResponse = Response<ScheduleResponse>

export const createScheduleController = async (
  req: CreateScheduleControllerRequest,
  res: CreateScheduleControllerResponse
) => {
  try {
    const schedule = await prismaClient.schedule.create({
      select: scheduleSelect,
      data: {
        title: req.body.title,
        description: req.body.description,
        projectId: req.params.projectId,
      },
    })
    return res.status(201).json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateScheduleControllerRequest = WithAuthProp<
  Request<
    { projectId: string; scheduleId: string },
    object,
    Pick<Schedule, 'title' | 'description'>
  >
>

type UpdateScheduleControllerResponse = Response<ScheduleResponse>

export const updateScheduleController = async (
  req: UpdateScheduleControllerRequest,
  res: UpdateScheduleControllerResponse
) => {
  try {
    const schedule = await prismaClient.schedule.update({
      select: scheduleSelect,
      where: {
        id: req.params.scheduleId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        title: req.body.title,
        description: req.body.description || null,
      },
    })
    return res.json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type DeleteScheduleControllerRequest = WithAuthProp<
  Request<{ projectId: string; scheduleId: string }>
>

type DeleteScheduleControllerResponse = Response<ScheduleResponse>

export const deleteScheduleController = async (
  req: DeleteScheduleControllerRequest,
  res: DeleteScheduleControllerResponse
) => {
  try {
    const schedule = await prismaClient.schedule.delete({
      select: scheduleSelect,
      where: {
        id: req.params.scheduleId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return res.json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
