import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Note, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'

export const getNotesController = async (
  req: WithAuthProp<
    Request<{ projectId: string }, {}, {}, { page?: string; size?: string }>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  const { page, size } = paginationParams(req)
  try {
    const [notes, noteCount] = await Promise.all([
      prismaClient.note.findMany({
        select: {
          id: true,
          createdAt: true,
          name: true,
        },
        where: {
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prismaClient.note.count({
        where: {
          project: {
            id: req.params.projectId,
            authorId: req.auth.userId!,
          },
        },
      }),
    ])
    if (notes.length === 0)
      return res.status(404).json({ message: 'Notes not found' })
    return res.json({
      content: notes,
      page,
      size,
      total: noteCount,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const getNoteController = async (
  req: WithAuthProp<Request<{ projectId: string; noteId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const note = await prismaClient.note.findUnique({
      select: {
        id: true,
        createdAt: true,
        name: true,
        editorState: true,
      },
      where: {
        id: req.params.noteId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    if (!note) return res.status(404).json({ message: 'Note not found' })
    return res.json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const createNoteController = async (
  req: WithAuthProp<Request<{ projectId: string }, {}, Pick<Note, 'name'>>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const note = await prismaClient.note.create({
      select: {
        id: true,
        createdAt: true,
        name: true,
        editorState: true,
      },
      data: {
        name: req.body.name,
        editorState: Prisma.JsonNull,
        projectId: req.params.projectId,
      },
    })
    return res.status(201).json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const updateNoteController = async (
  req: WithAuthProp<
    Request<{ projectId: string; noteId: string }, {}, Pick<Note, 'name'>>
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const note = await prismaClient.note.update({
      select: {
        id: true,
        createdAt: true,
        name: true,
        editorState: true,
      },
      where: {
        id: req.params.noteId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        name: req.body.name,
      },
    })
    return res.json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export const deleteNoteController = async (
  req: WithAuthProp<Request<{ projectId: string; noteId: string }>>,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  try {
    const note = await prismaClient.note.delete({
      select: {
        id: true,
        createdAt: true,
        name: true,
        editorState: true,
      },
      where: {
        id: req.params.noteId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return res.json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
