import { Prisma } from '@prisma/client'
import webpush, { PushSubscription } from 'web-push'
import prismaClient from '../client'

export const PUSH_SUBSCRIPTION: Pick<PushSubscription, 'endpoint' | 'keys'> = {
  endpoint:
    'https://fcm.googleapis.com/fcm/send/eNsunHSowLg:APA91bGvgTjCxTYkrZA6RBEFcEEfgiWsp-DCN9C51XfiV47d_sbV6vDxvjmzj_DJRVYJU4L_ogu4PWo5tlqM3kfrQbuArXw5X82oXUQqrjlg5oBAR0Ogg-1g6QAPtr5BkyjheMRD-54f',
  keys: {
    p256dh:
      'BOwwPr9UuVb32HyG5oOuC9mFJVr8uDs_mdbBDEM5uG5xfE4E1N6DsO9vmTvtv18ZGmzuZPUcfsW2gxBiNa-daBA',
    auth: 'B6hCa1S-W2CkCFyKs9h5qw',
  },
}

export const pushSubscriptionSelect = {
  id: true,
  createdAt: true,
  entity: true,
} satisfies Prisma.PushSubscriptionSelect

export const registerNotifications = async () => {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_SECRET_KEY!
  )
  setTimeout(
    () =>
      setInterval(async () => {
        const notifications = await prismaClient.notification.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            pushSubscriptions: { select: { entity: true } },
          },
          where: {
            startsAt: {
              lte: new Date(),
            },
            isActive: true,
            isSent: false,
          },
        })
        notifications.forEach((notification) =>
          notification.pushSubscriptions.forEach(async (pushSubscription) => {
            try {
              await webpush.sendNotification(
                pushSubscription.entity as unknown as PushSubscription,
                JSON.stringify({
                  title: notification.title,
                  ...(notification.description && {
                    body: notification.description,
                  }),
                })
              )
              await prismaClient.notification.update({
                where: {
                  id: notification.id,
                },
                data: {
                  isSent: true,
                },
              })
            } catch (error) {
              console.error(error)
            }
          })
        )
      }, 60000),
    (60 - new Date().getSeconds()) * 1000
  )
}
