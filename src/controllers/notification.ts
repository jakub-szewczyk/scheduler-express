import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Notification } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { notificationSelect } from '../modules/notification'

type NotificationResponse = Pick<
  Notification,
  keyof typeof notificationSelect
> | null

type GetNotificationControllerRequest = WithAuthProp<
  Request<{ projectId: string; scheduleId: string; eventId: string }>
>

type GetNotificationControllerResponse = Response<NotificationResponse>

export const getNotificationController = async (
  req: GetNotificationControllerRequest,
  res: GetNotificationControllerResponse
) => {
  try {
    const notification = await prismaClient.notification.findFirst({
      select: notificationSelect,
      where: {
        event: {
          id: req.params.eventId,
          schedule: {
            id: req.params.scheduleId,
            project: {
              id: req.params.projectId,
              authorId: req.auth.userId!,
            },
          },
        },
      },
    })
    return res.json(notification)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateNotificationControllerRequest = WithAuthProp<
  Request<
    { projectId: string; scheduleId: string; eventId: string },
    object,
    Pick<Notification, 'title' | 'description' | 'startsAt'>
  >
>

type CreateNotificationControllerResponse = Response<NotificationResponse>

export const createNotificationController = async (
  req: CreateNotificationControllerRequest,
  res: CreateNotificationControllerResponse
) => {
  try {
    const notification = await prismaClient.notification.create({
      select: notificationSelect,
      data: {
        title: req.body.title,
        description: req.body.description,
        startsAt: req.body.startsAt,
        event: {
          connect: {
            id: req.params.eventId,
            schedule: {
              id: req.params.scheduleId,
              project: {
                id: req.params.projectId,
                authorId: req.auth.userId!,
              },
            },
          },
        },
      },
    })
    return res.status(201).json(notification)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
