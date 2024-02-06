import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Issue } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'

interface UpdateIssueRequestParams {
  projectId: string
  boardId: string
  statusId: string
  issueId: string
}

export const updateIssueController = async (
  req: WithAuthProp<
    Request<UpdateIssueRequestParams, object, Pick<Issue, 'title' | 'content'>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const issue = await prismaClient.issue.update({
      select: {
        id: true,
        title: true,
        content: true,
      },
      where: {
        id: req.params.issueId,
        status: {
          id: req.params.statusId,
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
        title: req.body.title,
        content: req.body.content,
      },
    })
    return res.json(issue)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
