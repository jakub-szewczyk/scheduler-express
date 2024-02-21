import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'

export const getSchedulesController = async (
  req: WithAuthProp<
    Request<
      { projectId: string },
      object,
      object,
      { page?: string; size?: string; name?: string }
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  const { page, size } = paginationParams(req)
  try {
    const where: Prisma.ScheduleWhereInput = {
      name: {
        contains: req.query.name,
      },
      project: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    }
    const [schedules, scheduleCount] = await Promise.all([
      prismaClient.schedule.findMany({
        select: {
          id: true,
          createdAt: true,
          name: true,
        },
        where,
        orderBy: { createdAt: 'desc' },
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
      total: scheduleCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const getScheduleController = async (
  req: WithAuthProp<Request<{ projectId: string; scheduleId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const schedule = await prismaClient.schedule.findUnique({
      select: {
        id: true,
        createdAt: true,
        name: true,
        rows: {
          select: {
            id: true,
            rowId: true,
            index: true,
            day: true,
            starts: true,
            ends: true,
            room: true,
            subject: true,
            notification: {
              select: {
                time: true,
                active: true,
                title: true,
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      where: {
        id: req.params.scheduleId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    if (!schedule)
      return res.status(404).json({ message: 'Schedule not found' })
    return res.json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const createScheduleController = async (
  req: WithAuthProp<Request<{ projectId: string }, object, { name: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg as string })
  try {
    const schedule = await prismaClient.schedule.create({
      select: {
        id: true,
        createdAt: true,
        name: true,
        rows: {
          select: {
            id: true,
            rowId: true,
            index: true,
            day: true,
            starts: true,
            ends: true,
            room: true,
            subject: true,
            notification: {
              select: {
                time: true,
                active: true,
                title: true,
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      data: {
        name: req.body.name,
        projectId: req.params.projectId,
        rows: {
          createMany: {
            data: [
              { day: 'Monday', index: 0 },
              { day: 'Tuesday', index: 1 },
              { day: 'Wednesday', index: 2 },
              { day: 'Thursday', index: 3 },
              { day: 'Friday', index: 4 },
            ],
          },
        },
      },
    })
    return res.status(201).json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const updateScheduleController = async (
  req: WithAuthProp<
    Request<{ projectId: string; scheduleId: string }, object, { name: string }>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const schedule = await prismaClient.schedule.update({
      select: {
        id: true,
        createdAt: true,
        name: true,
        rows: {
          select: {
            id: true,
            rowId: true,
            index: true,
            day: true,
            starts: true,
            ends: true,
            room: true,
            subject: true,
            notification: {
              select: {
                time: true,
                active: true,
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      where: {
        id: req.params.scheduleId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        name: req.body.name,
      },
    })
    return res.json(schedule)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const deleteScheduleController = async (
  req: WithAuthProp<Request<{ projectId: string; scheduleId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const schedule = await prismaClient.schedule.delete({
      select: {
        id: true,
        createdAt: true,
        name: true,
        rows: {
          select: {
            id: true,
            rowId: true,
            index: true,
            day: true,
            starts: true,
            ends: true,
            room: true,
            subject: true,
            notification: {
              select: {
                time: true,
                active: true,
                title: true,
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
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
