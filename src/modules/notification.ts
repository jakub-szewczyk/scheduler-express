import { Day } from '@prisma/client'
import { RecurrenceRule, scheduleJob } from 'node-schedule'
import webpush, { PushSubscription } from 'web-push'
import prismaClient from '../client'

export const schedulePushNotificationJobs = async () => {
  const rows = await prismaClient.row.findMany({
    select: {
      id: true,
      day: true,
      notification: true,
    },
    where: {
      notification: {
        active: true,
      },
    },
  })
  rows.forEach(async (row) => {
    const project = await prismaClient.project.findFirst({
      select: { authorId: true, schedules: { select: { name: true } } },
      where: { schedules: { some: { rows: { some: { id: row.id } } } } },
    })
    const pushSubscriptions = await prismaClient.pushSubscription.findMany({
      where: { authorId: project?.authorId },
    })
    const recurrenceRule = new RecurrenceRule()
    recurrenceRule.dayOfWeek =
      (
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Day[]
      ).findIndex((day) => day === row.day) + 1
    recurrenceRule.hour = new Date(row.notification!.time).getHours()
    recurrenceRule.minute = new Date(row.notification!.time).getMinutes()
    scheduleJob(row.notification!.id, recurrenceRule, async () => {
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
}
