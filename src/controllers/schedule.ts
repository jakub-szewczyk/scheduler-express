import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

const prismaClient = new PrismaClient()

export const getSchedulesController = async (
  req: WithAuthProp<Request<{ projectId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const schedules = await prismaClient.schedule.findMany({
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
    })
    if (schedules.length === 0)
      return res.status(404).json({ message: 'Schedules not found' })
    return res.json(schedules)
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
            day: true,
            starts: true,
            ends: true,
            room: true,
            subject: true,
            notification: true,
          },
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
