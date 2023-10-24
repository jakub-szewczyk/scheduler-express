import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'

export const pushSubscriptionController = async (
  req: WithAuthProp<
    Request<object, object, ReturnType<PushSubscription['toJSON']>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const pushSubscription = await prismaClient.pushSubscription.create({
      data: {
        authorId: req.auth.userId!,
        pushSubscription: req.body as Prisma.JsonObject,
      },
    })
    return res.status(201).json(pushSubscription)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
