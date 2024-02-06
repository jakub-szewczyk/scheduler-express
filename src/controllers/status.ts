import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Issue, Status } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'

interface UpdateStatusesRequestParams {
  projectId: string
  boardId: string
}

export type UpdateStatusesRequestBody = (Pick<Status, 'title'> & {
  id?: string
  issues: (Pick<Issue, 'title' | 'content'> & { id?: string })[]
})[]

export const updateStatusesController = async (
  req: WithAuthProp<
    Request<UpdateStatusesRequestParams, object, UpdateStatusesRequestBody>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    await prismaClient.$transaction([
      prismaClient.status.deleteMany({
        where: {
          id: {
            notIn: req.body.map((status) => status.id!),
          },
          board: {
            id: req.params.boardId,
            project: {
              id: req.params.projectId,
              authorId: req.auth.userId!,
            },
          },
        },
      }),
      ...req.body.map((status, index) =>
        prismaClient.status.upsert({
          where: {
            id: status.id || '',
            board: {
              id: req.params.boardId,
              project: {
                id: req.params.projectId,
                authorId: req.auth.userId!,
              },
            },
          },
          create: {
            boardId: req.params.boardId,
            index,
            title: status.title,
          },
          update: {
            index,
          },
        })
      ),
      prismaClient.issue.deleteMany({
        where: {
          id: {
            notIn: req.body.flatMap((status) =>
              status.issues.map((issue) => issue.id!)
            ),
          },
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
      }),
      ...req.body.flatMap((status) =>
        status.issues.map((issue, index) =>
          prismaClient.issue.upsert({
            where: {
              id: issue.id || '',
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
            create: {
              statusId: status.id!,
              index,
              title: issue.title,
              content: issue.content,
            },
            update: {
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

interface UpdateStatusRequestParams extends UpdateStatusesRequestParams {
  statusId: string
}

export const updateStatusController = async (
  req: WithAuthProp<
    Request<UpdateStatusRequestParams, object, Pick<Status, 'title'>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const status = await prismaClient.status.update({
      select: {
        id: true,
        title: true,
        issues: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
      where: {
        id: req.params.statusId,
      },
      data: {
        title: req.body.title,
      },
    })
    return res.json(status)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
