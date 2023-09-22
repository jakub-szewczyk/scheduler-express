import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { Request, Response } from 'express'

export const getNotesController = async (
  req: WithAuthProp<Request<{ projectId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const notes = await prismaClient.note.findMany({
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
    if (notes.length === 0)
      return res.status(404).json({ message: 'Notes not found' })
    return res.json(notes)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
