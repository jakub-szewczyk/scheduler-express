import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Issue, PrismaClient, Status } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

const prismaClient = new PrismaClient()

export const updateStatusesController = async (
  req: WithAuthProp<
    Request<
      { projectId: string; boardId: string },
      {},
      (Pick<Status, 'id'> & {
        issues: Pick<Issue, 'id'>[]
      })[]
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const result = await prismaClient.$transaction([
      ...req.body.map((status, index) =>
        prismaClient.status.update({
          where: {
            id: status.id,
            board: {
              id: req.params.boardId,
              project: {
                id: req.params.projectId,
                authorId: req.auth.userId!,
              },
            },
          },
          data: {
            index,
          },
        })
      ),
      ...req.body.flatMap((status) =>
        status.issues.map((issue, index) =>
          prismaClient.issue.update({
            where: {
              id: issue.id,
              status: {
                board: {
                  id: req.params.boardId,
                  project: {
                    id: req.params.projectId,
                    authorId: req.auth.userId!,
                  },
                },
              },
            },
            data: {
              index,
              statusId: status.id,
            },
          })
        )
      ),
    ])
    return res.status(204).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
