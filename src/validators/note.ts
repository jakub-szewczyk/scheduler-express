import { body, param, query } from 'express-validator'
import prismaClient from '../client'
import { validationMiddleware } from '../middlewares/validation'

export const getNotesValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  query('page', 'Page number must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query('size', 'Page size must be a non-negative integer')
    .isInt({ gt: -1 })
    .optional(),
  query(
    'createdAt',
    'Invalid value was provided for sorting notes by creation date'
  )
    .isIn(['ASC', 'DESC'])
    .optional(),
  validationMiddleware,
]

export const getNoteValidator = [
  param('projectId').notEmpty(),
  param('noteId').notEmpty(),
  validationMiddleware,
]

export const createNoteValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  body('title', 'You have to give your note a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const note = await prismaClient.note.findUnique({
        where: {
          title_projectId: {
            title,
            projectId: req.params!.projectId,
          },
        },
      })
      if (note)
        throw new Error('This title has already been used by one of your notes')
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const updateNoteValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  param('noteId')
    .notEmpty()
    .custom(async (noteId: string, { req }) => {
      try {
        await prismaClient.note.findFirstOrThrow({
          where: {
            id: noteId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        })
      } catch (error) {
        req.statusCode = 404
        throw new Error('Note not found')
      }
    }),
  body('title', 'You have to give your note a unique title')
    .trim()
    .notEmpty()
    .custom(async (title: string, { req }) => {
      const note = await prismaClient.note.findFirst({
        where: {
          id: { not: req.params!.noteId },
          title,
          projectId: req.params!.projectId,
        },
      })
      if (note)
        throw new Error('This title has already been used by one of your notes')
    }),
  body('description').trim().optional(),
  validationMiddleware,
]

export const deleteNoteValidator = [
  param('projectId').custom(async (projectId: string, { req }) => {
    try {
      await prismaClient.project.findUniqueOrThrow({
        where: {
          id: projectId,
          authorId: req.auth.userId,
        },
      })
    } catch (error) {
      req.statusCode = 404
      throw new Error('Project not found')
    }
  }),
  param('noteId')
    .notEmpty()
    .custom(async (noteId: string, { req }) => {
      try {
        await prismaClient.note.findFirstOrThrow({
          where: {
            id: noteId,
            project: {
              id: req.params!.projectId,
              authorId: req.auth.userId,
            },
          },
        })
      } catch (error) {
        req.statusCode = 404
        throw new Error('Note not found')
      }
    }),
  validationMiddleware,
]
