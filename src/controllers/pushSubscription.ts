import { WithAuthProp } from '@clerk/clerk-sdk-node'
import {
  Prisma,
  PushSubscription as PrismaPushSubscription,
} from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { pushSubscriptionSelect } from '../modules/pushSubscription'

type CreatePushSubscriptionControllerRequest = WithAuthProp<
  Request<object, object, ReturnType<PushSubscription['toJSON']>>
>

type CreatePushSubscriptionControllerResponse = Response<
  Pick<PrismaPushSubscription, 'entity'>
>

export const createPushSubscriptionController = async (
  req: CreatePushSubscriptionControllerRequest,
  res: CreatePushSubscriptionControllerResponse
) => {
  try {
    const pushSubscription = await prismaClient.pushSubscription.create({
      select: pushSubscriptionSelect,
      data: {
        entity: req.body as Prisma.JsonObject,
        authorId: req.auth.userId!,
      },
    })
    return res.status(201).json(pushSubscription)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
