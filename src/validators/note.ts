import { body, param } from 'express-validator'
import prismaClient from '../client'

export const getNotesValidator = param('projectId').notEmpty()

export const getNoteValidator = [
  param('projectId').notEmpty(),
  param('noteId').notEmpty(),
]

export const createNoteValidator = [
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
  body('name', 'You have to give your note a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const note = await prismaClient.note.findUnique({
        where: {
          name_projectId: {
            name,
            projectId: req.params!.projectId,
          },
        },
      })
      if (note)
        throw new Error('This name has already been used by one of your notes')
    }),
]

export const updateNoteValidator = [
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
  param('noteId')
    .notEmpty()
    .custom(async (noteId: string, { req }) => {
      const note = await prismaClient.note.findUnique({
        where: {
          id: noteId,
          project: {
            id: req.params!.projectId,
            authorId: req.auth.userId,
          },
        },
      })
      if (!note) throw new Error('Note not found')
    }),
  body('name', 'You have to give your note a unique name')
    .trim()
    .notEmpty()
    .custom(async (name: string, { req }) => {
      const note = await prismaClient.note.findUnique({
        where: {
          AND: [
            { id: { not: req.params!.noteId } },
            { name, projectId: req.params!.projectId },
          ],
          name_projectId: { name, projectId: req.params!.projectId },
        },
      })
      if (note)
        throw new Error('This name has already been used by one of your notes')
    }),
]
