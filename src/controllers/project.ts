import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { PrismaClient, Project } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

const prismaClient = new PrismaClient()

export const getProjectsController = async (
  req: WithAuthProp<Request>,
  res: Response
) => {
  try {
    const projects = await prismaClient.project.findMany({
      where: {
        authorId: req.auth.userId!,
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(projects)
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
      data: {
        name: req.body.name,
        description: req.body.description,
        authorId: req.auth.userId!,
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
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
      where: {
        id: req.params.projectId,
      },
      data: {
        name: req.body.name,
        description: req.body.description || null,
        authorId: req.auth.userId!,
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
    })
    return res.status(200).json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
