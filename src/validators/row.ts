import { Notification, PrismaClient, Row } from '@prisma/client'
import { body, param } from 'express-validator'
import { equals } from 'ramda'

const prismaClient = new PrismaClient()

const DAYS: NonNullable<Row['day']>[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
]

export const updateRowsValidator = [
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
  body().isArray().withMessage('Expected payload must be an array'),
  body('*.id')
    .notEmpty()
    .withMessage('Expected field `id` must not be empty')
    .custom(async (id: string, { req, path }) => {
      const row = await prismaClient.row.findUnique({
        where: {
          id,
          schedule: {
            id: req.params!.scheduleId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        },
      })
      if (!row) {
        const index = path[1]
        if (!req.body[index].rowId)
          throw new Error('Expected field `rowId` must not be empty')
        const row = await prismaClient.row.findFirst({
          where: {
            id: req.body[index].rowId,
            day: {
              in: DAYS,
            },
            schedule: {
              id: req.params!.scheduleId,
              project: {
                id: req.params!.projectId,
                authorId: req.auth.userId,
              },
            },
          },
        })
        if (!row)
          throw new Error(
            'Expected field `rowId` must reference an existing parent row'
          )
      }
    }),
  body('*.index')
    .isInt()
    .withMessage('Expected field `index` must be an integer')
    .custom(async (index: string, { req }) => {
      const rows = req.body as Row[]
      if (
        !equals(
          rows.map((row) => row.index),
          Array(rows.length)
            .fill(null)
            .map((_, index) => index)
        )
      )
        throw new Error('Invalid indexes arrangement')
    }),
  body('*.day')
    .optional({ values: 'null' })
    .isIn(DAYS)
    .withMessage(
      `Expected field \`day\` must have one of these values: ${DAYS.join(', ')}`
    ),
  body('*.starts')
    .optional({ values: 'null' })
    .isISO8601()
    .toDate()
    .withMessage('Expected field `starts` must be a valid date format'),
  body('*.ends')
    .optional({ values: 'null' })
    .isISO8601()
    .toDate()
    .withMessage('Expected field `ends` must be a valid date format'),
  body('*.room')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Expected field `room` must be a string'),
  body('*.subject')
    .optional({ values: 'null' })
    .isString()
    .withMessage('Expected field `subject` must be a string'),
  body('*.notification')
    .optional({ values: 'null' })
    .isObject()
    .withMessage('Expected field `notification` must be an object'),
  body('*.notification.time')
    .if(
      async (time: Notification['time'], { req, path }) =>
        req.body[path[1]].notification.time
    )
    .isISO8601()
    .toDate()
    .withMessage(
      'Expected field `notification.time` must be a valid date format'
    ),
  body('*.notification.active')
    .if(
      async (active: Notification['active'], { req, path }) =>
        req.body[path[1]].notification.active
    )
    .isBoolean({ strict: true })
    .withMessage('Expected field `notification.active` must be a boolean'),
]
