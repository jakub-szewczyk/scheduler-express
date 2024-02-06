import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Day, Notification, Prisma, Row } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { RecurrenceRule, cancelJob, scheduleJob } from 'node-schedule'
import webpush, { PushSubscription } from 'web-push'
import prismaClient from '../client'

export const updateRowsController = async (
  req: WithAuthProp<
    Request<
      { projectId: string; scheduleId: string },
      object,
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
      > & {
        notification?: Pick<Notification, 'time' | 'active' | 'title'> | null
      })[]
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const project = await prismaClient.project.findUnique({
      select: {
        authorId: true,
        schedules: {
          select: {
            name: true,
            rows: { select: { notification: { select: { id: true } } } },
          },
          where: { id: req.params.scheduleId },
        },
      },
      where: { id: req.params.projectId, authorId: req.auth.userId! },
    })
    const pushSubscriptions = await prismaClient.pushSubscription.findMany({
      where: { authorId: project?.authorId },
    })
    const rowWithNotification = Prisma.validator<Prisma.RowArgs>()({
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
          select: { id: true, time: true, active: true, title: true },
        },
      },
    })
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
          select: rowWithNotification.select,
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
            day: row.day,
            starts: row.starts,
            ends: row.ends,
            room: row.room,
            subject: row.subject,
            ...(row.notification && {
              notification: {
                create: {
                  time: row.notification.time,
                  active: row.notification.active,
                  title: row.notification.title,
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
                    title: row.notification.title,
                  },
                  update: {
                    time: row.notification.time,
                    active: row.notification.active,
                    title: row.notification.title,
                  },
                },
              },
            }),
          },
        })
      ),
    ])
    const rows = result.slice(1) as Prisma.RowGetPayload<
      typeof rowWithNotification
    >[]
    project?.schedules[0].rows.forEach(
      (row) => row.notification?.id && cancelJob(row.notification.id)
    )
    rows
      .filter((row) => row.notification?.active)
      .forEach((row) => {
        const recurrenceRule = new RecurrenceRule()
        recurrenceRule.dayOfWeek =
          (
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Day[]
          ).findIndex((day) => day === row.day) + 1
        recurrenceRule.hour = new Date(row.notification!.time).getHours()
        recurrenceRule.minute = new Date(row.notification!.time).getMinutes()
        scheduleJob(row.notification!.id, recurrenceRule, () => {
          pushSubscriptions.forEach((pushSubscription) =>
            webpush.sendNotification(
              pushSubscription.pushSubscription as unknown as PushSubscription,
              JSON.stringify({
                title: row.notification?.title || project?.schedules[0].name,
                body: `Scheduled event at ${new Intl.DateTimeFormat('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(row.notification!.time))}`,
              })
            )
          )
        })
      })
    return res.json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
