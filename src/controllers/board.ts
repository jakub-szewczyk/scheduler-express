import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

const prismaClient = new PrismaClient()

export const getBoardsController = async (
  req: WithAuthProp<Request<{ projectId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const boards = await prismaClient.board.findMany({
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
    if (boards.length === 0)
      return res.status(404).json({ message: 'Boards not found' })
    return res.json(boards)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
