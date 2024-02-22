import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Note, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import prismaClient from '../client'
import { paginationParams } from '../modules/pagination'

export const getNotesController = async (
  req: WithAuthProp<
    Request<
      { projectId: string },
      object,
      object,
      { page?: string; size?: string; name?: string }
    >
  >,
  res: Response
) => {
  const result = validationResult(req)
  if (!result.isEmpty())
    return res.status(400).json({ message: result.array()[0].msg })
  const { page, size } = paginationParams(req)
  const where: Prisma.NoteWhereInput = {
    name: {
      contains: req.query.name,
    },
    project: {
      id: req.params.projectId,
      authorId: req.auth.userId!,
    },
  }
  try {
    const [notes, noteCount] = await Promise.all([
      prismaClient.note.findMany({
        select: {
          id: true,
          createdAt: true,
          name: true,
        },
        where,
        orderBy: { createdAt: 'desc' },
        take: size,
        skip: page * size,
      }),
      prismaClient.note.count({
        where,
      }),
    ])
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
  req: WithAuthProp<Request<{ projectId: string }, object, Pick<Note, 'name'>>>,
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
    Request<{ projectId: string; noteId: string }, object, Pick<Note, 'name'>>
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
