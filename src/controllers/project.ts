import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { PrismaClient, Project } from '@prisma/client'
import { Request, Response } from 'express'

const prismaClient = new PrismaClient()

export const createProjectController = async (
  req: WithAuthProp<Request<void, void, Pick<Project, 'name'>>>,
  res: Response
) => {
  try {
    const project = await prismaClient.project.create({
      data: {
        name: req.body.name,
        authorId: req.auth.userId!,
      },
    })
    res.status(201).json(project)
  } catch (error) {
    console.error(error)
    res.status(500).end()
  }
}
