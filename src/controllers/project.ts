import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma, Project } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { projectData, projectSelect } from '../modules/project'
import { PaginableResponse } from '../types/pagination'

type GetProjectsControllerRequest = WithAuthProp<
  Request<
    object,
    object,
    object,
    {
      page?: string
      size?: string
      name?: string
      createdAt?: 'ASC' | 'DESC'
    }
  >
>

type GetProjectsControllerResponse = Response<
  PaginableResponse<Pick<Project, 'id' | 'createdAt' | 'name' | 'description'>>
>

export const getProjectsController = async (
  req: GetProjectsControllerRequest,
  res: GetProjectsControllerResponse
) => {
  const { page, size } = paginationParams(req)
  try {
    const where: Prisma.ProjectWhereInput = {
      authorId: req.auth.userId!,
      ...(req.query.name && {
        name: {
          contains: req.query.name,
          mode: 'insensitive',
        },
      }),
    }
    const [projects, total] = await Promise.all([
      prismaClient.project.findMany({
        select: projectSelect,
        where,
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
        take: size,
        skip: page * size,
      }),
      prismaClient.project.count({
        where,
      }),
    ])
    return res.json({
      content: projects,
      page,
      size,
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type GetProjectControllerRequest = WithAuthProp<Request<{ projectId: string }>>

type GetProjectControllerResponse = Response<Project>

export const getProjectController = async (
  req: GetProjectControllerRequest,
  res: GetProjectControllerResponse
) => {
  try {
    const project = await prismaClient.project.findUnique({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        description: true,
        authorId: true,
      },
      where: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    })
    return project ? res.json(project) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const createProjectController = async (
  req: WithAuthProp<
    Request<object, object, Pick<Project, 'name' | 'description'>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: projectData({
        name: req.body.name,
        description: req.body.description,
        authorId: req.auth.userId!,
      }),
    })
    return res.status(201).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const updateProjectController = async (
  req: WithAuthProp<
    Request<
      { projectId: string },
      object,
      Pick<Project, 'name' | 'description'>
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const project = await prismaClient.project.update({
      select: projectSelect,
      where: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
      data: {
        name: req.body.name,
        description: req.body.description || null,
      },
    })
    return res.status(200).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const deleteProjectController = async (
  req: WithAuthProp<Request<{ projectId: string }, object, object>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const project = await prismaClient.project.delete({
      select: projectSelect,
      where: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    })
    return res.status(200).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
