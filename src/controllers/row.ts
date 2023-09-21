import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Notification, Row } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'

export const updateRowsController = async (
  req: WithAuthProp<
    Request<
      { projectId: string; scheduleId: string },
      {},
      (Pick<
        Row,
        | 'id'
        | 'rowId'
        | 'index'
        | 'day'
        | 'starts'
        | 'ends'
        | 'room'
        | 'subject'
      > & { notification?: Pick<Notification, 'time' | 'active'> | null })[]
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const result = await prismaClient.$transaction([
      prismaClient.row.deleteMany({
        where: {
          id: {
            notIn: req.body.map((row) => row.id),
          },
          schedule: {
            id: req.params.scheduleId,
            project: {
              id: req.params.projectId,
              authorId: req.auth.userId!,
            },
          },
        },
      }),
      ...req.body.map((row) =>
        prismaClient.row.upsert({
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
          where: {
            id: row.id,
            schedule: {
              id: req.params.scheduleId,
              project: {
                id: req.params.projectId,
                authorId: req.auth.userId!,
              },
            },
          },
          create: {
            scheduleId: req.params.scheduleId,
            rowId: row.rowId,
            index: row.index,
            starts: row.starts,
            ends: row.ends,
            room: row.room,
            subject: row.subject,
            ...(row.notification && {
              notification: {
                create: {
                  time: row.notification.time,
                  active: row.notification.active,
                },
              },
            }),
          },
          update: {
            index: row.index,
            starts: row.starts,
            ends: row.ends,
            room: row.room,
            subject: row.subject,
            ...(row.notification && {
              notification: {
                upsert: {
                  create: {
                    time: row.notification.time,
                    active: row.notification.active,
                  },
                  update: {
                    time: row.notification.time,
                    active: row.notification.active,
                  },
                },
              },
            }),
          },
        })
      ),
    ])
    return res.json(result.slice(1))
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
