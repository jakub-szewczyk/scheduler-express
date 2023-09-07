import { PrismaClient } from '@prisma/client'
import { body, param } from 'express-validator'

const prismaClient = new PrismaClient()

export const getSchedulesValidator = param('projectId').notEmpty()

export const getScheduleValidator = [
  param('projectId').notEmpty(),
  param('scheduleId').notEmpty(),
]

export const createScheduleValidator = [
  param('projectId')
    .notEmpty()
    .custom(async (projectId: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
      if (!project) throw new Error('Project not found')
    }),
  body('name', 'You have to give your schedule a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const schedule = await prismaClient.schedule.findUnique({
        where: {
          name_projectId: {
            name,
            projectId: req.params!.projectId,
          },
        },
      })
      if (schedule)
        throw new Error(
          'This name has already been used by one of your schedules'
        )
    }),
]

export const updateScheduleValidator = [
  param('projectId')
    .notEmpty()
    .custom(async (projectId: string, { req }) => {
      const project = await prismaClient.project.findUnique({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
      if (!project) throw new Error('Project not found')
    }),
  param('scheduleId')
    .notEmpty()
    .custom(async (scheduleId: string, { req }) => {
      const schedule = await prismaClient.schedule.findUnique({
        where: {
          id: scheduleId,
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
      if (!schedule) throw new Error('Schedule not found')
    }),
  body('name', 'You have to give your schedule a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const schedule = await prismaClient.schedule.findUnique({
        where: {
          AND: [
            { id: { not: req.params!.scheduleId } },
            { name, projectId: req.params!.projectId },
          ],
          name_projectId: { name, projectId: req.params!.projectId },
        },
      })
      if (schedule)
        throw new Error(
          'This name has already been used by one of your schedules'
        )
    }),
]
