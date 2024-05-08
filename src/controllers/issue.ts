import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Issue, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { generateRank } from '../modules/common'
import { issueSelect } from '../modules/issue'
import { paginationParams } from '../modules/pagination'
import { PaginableResponse } from '../types/pagination'

export type IssueBody = Pick<Issue, 'title' | 'description' | 'priority'> & {
  prevIssueId?: string | null
  nextIssueId?: string | null
  statusId?: string | null
}

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

type GetIssueControllerRequest = WithAuthProp<
  Request<{
    projectId: string
    boardId: string
    statusId: string
    issueId: string
  }>
>

type GetIssueControllerResponse = Response<IssueResponse>

export const getIssueController = async (
  req: GetIssueControllerRequest,
  res: GetIssueControllerResponse
) => {
  try {
    const issue = await prismaClient.issue.findUnique({
      select: issueSelect,
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
    })
    return issue ? res.json(issue) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateIssueControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string; statusId: string },
    object,
    IssueBody
  >
>

type CreateIssueControllerResponse = Response<IssueResponse>

export const createIssueController = async (
  req: CreateIssueControllerRequest,
  res: CreateIssueControllerResponse
) => {
  try {
    const issue = await prismaClient.issue.create({
      select: issueSelect,
      data: {
        title: req.body.title,
        description: req.body.description || null,
        rank: generateRank({
          prevRank: req.prevIssueRank,
          nextRank: req.nextIssueRank,
        }).format(),
        priority: req.body.priority,
        status: {
          connect: {
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
      },
    })
    return res.status(201).json(issue)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateIssueControllerRequest = WithAuthProp<
  Request<
    { projectId: string; boardId: string; statusId: string; issueId: string },
    object,
    IssueBody
  >
>

type UpdateIssueControllerResponse = Response<IssueResponse>

export const updateIssueController = async (
  req: UpdateIssueControllerRequest,
  res: UpdateIssueControllerResponse
) => {
  try {
    const issue = await prismaClient.issue.update({
      select: issueSelect,
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
        description: req.body.description,
        rank: generateRank({
          prevRank: req.prevIssueRank,
          nextRank: req.nextIssueRank,
        }).format(),
        priority: req.body.priority,
        ...(req.body.statusId && { statusId: req.body.statusId }),
      },
    })
    return res.json(issue)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
