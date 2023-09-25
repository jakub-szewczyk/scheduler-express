import { body, param } from 'express-validator'
import prismaClient from '../client'

export const updateEditorStateValidator = [
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
  body('editorState')
    .isObject()
    .withMessage('Expected field must be an object'),
]
