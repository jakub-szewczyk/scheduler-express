import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Prisma, Project } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { projectSelect } from '../modules/project'
import { PaginableResponse } from '../types/pagination'

type ProjectResponse = Pick<Project, keyof typeof projectSelect>

type GetProjectsControllerRequest = WithAuthProp<
  Request<
    object,
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
      createdAt?: 'ASC' | 'DESC'
    }
  >
>

type GetProjectsControllerResponse = Response<
  PaginableResponse<ProjectResponse>
>

export const getProjectsController = async (
  req: GetProjectsControllerRequest,
  res: GetProjectsControllerResponse
) => {
  const { page, size } = paginationParams(req)
  try {
    const where: Prisma.ProjectWhereInput = {
      authorId: req.auth.userId!,
      ...(req.query.title && {
        title: {
          contains: req.query.title,
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

type GetProjectControllerResponse = Response<ProjectResponse>

export const getProjectController = async (
  req: GetProjectControllerRequest,
  res: GetProjectControllerResponse
) => {
  try {
    const project = await prismaClient.project.findUnique({
      select: projectSelect,
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

type CreateProjectControllerRequest = WithAuthProp<
  Request<object, object, Pick<Project, 'title' | 'description'>>
>

type CreateProjectControllerResponse = Response<ProjectResponse>

export const createProjectController = async (
  req: CreateProjectControllerRequest,
  res: CreateProjectControllerResponse
) => {
  try {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: {
        title: req.body.title,
        description: req.body.description,
        authorId: req.auth.userId!,
      },
    })
    return res.status(201).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateProjectControllerRequest = WithAuthProp<
  Request<{ projectId: string }, object, Pick<Project, 'title' | 'description'>>
>

type UpdateProjectControllerResponse = Response<ProjectResponse>

export const updateProjectController = async (
  req: UpdateProjectControllerRequest,
  res: UpdateProjectControllerResponse
) => {
  try {
    const project = await prismaClient.project.update({
      select: projectSelect,
      where: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
      data: {
        title: req.body.title,
        description: req.body.description,
      },
    })
    return res.status(200).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type DeleteProjectControllerRequest = WithAuthProp<
  Request<{ projectId: string }, object, object>
>

type DeleteProjectControllerResponse = Response<ProjectResponse>

export const deleteProjectController = async (
  req: DeleteProjectControllerRequest,
  res: DeleteProjectControllerResponse
) => {
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
