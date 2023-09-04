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
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
      where: {
        authorId: req.auth.userId!,
      },
      orderBy: { createdAt: 'desc' },
    })
    if (projects.length === 0) {
      const project = await prismaClient.project.create({
        select: {
          id: true,
          createdAt: true,
          name: true,
          description: true,
        },
        data: {
          name: 'Project #1',
          description:
            "Edit your project's title and description. Manage your notes, boards and schedules within it.",
          authorId: req.auth.userId!,
          schedules: {
            create: {
              name: 'Schedule #1',
              rows: {
                createMany: {
                  data: [
                    { day: 'Monday', index: 0 },
                    { day: 'Tuesday', index: 1 },
                    { day: 'Wednesday', index: 2 },
                    { day: 'Thursday', index: 3 },
                    { day: 'Friday', index: 4 },
                  ],
                },
              },
            },
          },
        },
      })
      return res.json([project])
    }
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
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
        authorId: req.auth.userId!,
        schedules: {
          create: {
            name: 'Schedule #1',
            rows: {
              createMany: {
                data: [
                  { day: 'Monday', index: 0 },
                  { day: 'Tuesday', index: 1 },
                  { day: 'Wednesday', index: 2 },
                  { day: 'Thursday', index: 3 },
                  { day: 'Friday', index: 4 },
                ],
              },
            },
          },
        },
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
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
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
      select: {
        id: true,
        createdAt: true,
        name: true,
        description: true,
      },
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
