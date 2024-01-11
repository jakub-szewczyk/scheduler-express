import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Project } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'
import { PROJECT, projectData, projectSelect } from '../modules/project'

export const getProjectsController = async (
  req: WithAuthProp<Request<{}, {}, {}, { page?: string; size?: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  const { page, size } = paginationParams(req)
  try {
    const projectCount = await prismaClient.project.count({
      where: {
        authorId: req.auth.userId!,
      },
    })
    if (projectCount === 0) {
      const project = await prismaClient.project.create({
        select: projectSelect,
        data: projectData({
          ...PROJECT,
          authorId: req.auth.userId!,
        }),
      })
      return res.json({
        content: [project],
        page,
        size,
        total: projectCount,
      })
    }
    const projects = await prismaClient.project.findMany({
      select: projectSelect,
      where: {
        authorId: req.auth.userId!,
      },
      orderBy: { createdAt: 'desc' },
      take: size,
      skip: page * size,
    })
    return res.json({
      content: projects,
      page,
      size,
      total: projectCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const getProjectController = async (
  req: WithAuthProp<Request<{ projectId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const project = await prismaClient.project.findUnique({
      where: {
        id: req.params.projectId,
        authorId: req.auth.userId!,
      },
    })
    return res.json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const createProjectController = async (
  req: WithAuthProp<Request<{}, {}, Pick<Project, 'name' | 'description'>>>,
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
    Request<{ projectId: string }, {}, Pick<Project, 'name' | 'description'>>
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
  req: WithAuthProp<Request<{ projectId: string }, {}, {}>>,
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
