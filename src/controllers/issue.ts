import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Issue, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { issueSelect } from '../modules/issue'
import { paginationParams } from '../modules/pagination'
import { PaginableResponse } from '../types/pagination'

type IssueResponse = Pick<Issue, keyof typeof issueSelect>

type GetIssuesControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string; statusId: string },
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
    }
  >
>

type GetIssuesControllerResponse = Response<PaginableResponse<IssueResponse>>

export const getIssuesController = async (
  req: GetIssuesControllerRequest,
  res: GetIssuesControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.IssueWhereInput = {
    ...(req.query.title && {
      title: {
        contains: req.query.title,
        mode: 'insensitive',
      },
    }),
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
  }
  try {
    const [issues, total] = await Promise.all([
      prismaClient.issue.findMany({
        select: issueSelect,
        where,
        orderBy: { rank: 'asc' },
        take: size,
        skip: page * size,
      }),
      prismaClient.issue.count({
        where,
      }),
    ])
    return res.json({
      content: issues,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
