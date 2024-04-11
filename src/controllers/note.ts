import { WithAuthProp } from '@clerk/clerk-sdk-node'
import { Note, Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../client'
import { noteSelect } from '../modules/note'
import { paginationParams } from '../modules/pagination'
import { PaginableResponse } from '../types/pagination'

type NoteResponse = Pick<Note, keyof typeof noteSelect>

type GetNotesControllerRequest = WithAuthProp<
  Request<
    { projectId: string },
    object,
    object,
    {
      page?: string
      size?: string
      title?: string
      createdAt?: 'ASC' | 'DESC'
    }
  >
>

type GetNotesControllerResponse = Response<PaginableResponse<NoteResponse>>

export const getNotesController = async (
  req: GetNotesControllerRequest,
  res: GetNotesControllerResponse
) => {
  const { page, size } = paginationParams(req)
  const where: Prisma.NoteWhereInput = {
    ...(req.query.title && {
      title: {
        contains: req.query.title,
        mode: 'insensitive',
      },
    }),
    project: {
      id: req.params.projectId,
      authorId: req.auth.userId!,
    },
  }
  try {
    const [notes, total] = await Promise.all([
      prismaClient.note.findMany({
        select: noteSelect,
        where,
        orderBy: {
          createdAt: (req.query.createdAt?.toLowerCase() ||
            'desc') as Prisma.SortOrder,
        },
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
      total,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type GetNoteControllerRequest = WithAuthProp<
  Request<{ projectId: string; noteId: string }>
>

type GetNoteControllerResponse = Response<NoteResponse>

export const getNoteController = async (
  req: GetNoteControllerRequest,
  res: GetNoteControllerResponse
) => {
  try {
    const note = await prismaClient.note.findUnique({
      select: noteSelect,
      where: {
        id: req.params.noteId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
    })
    return note ? res.json(note) : res.status(404).end()
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type CreateNoteControllerRequest = WithAuthProp<
  Request<{ projectId: string }, object, Pick<Note, 'title' | 'description'>>
>

type CreateNoteControllerResponse = Response<NoteResponse>

export const createNoteController = async (
  req: CreateNoteControllerRequest,
  res: CreateNoteControllerResponse
) => {
  try {
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: req.body.title,
        description: req.body.description,
        content: Prisma.JsonNull,
        projectId: req.params.projectId,
      },
    })
    return res.status(201).json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type UpdateNoteControllerRequest = WithAuthProp<
  Request<
    { projectId: string; noteId: string },
    object,
    Pick<Note, 'title' | 'description'>
  >
>

type UpdateNoteControllerResponse = Response<NoteResponse>

export const updateNoteController = async (
  req: UpdateNoteControllerRequest,
  res: UpdateNoteControllerResponse
) => {
  try {
    const note = await prismaClient.note.update({
      select: noteSelect,
      where: {
        id: req.params.noteId,
        project: {
          id: req.params.projectId,
          authorId: req.auth.userId!,
        },
      },
      data: {
        title: req.body.title,
        description: req.body.description || null,
      },
    })
    return res.json(note)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

type DeleteNoteControllerRequest = WithAuthProp<
  Request<{ projectId: string; noteId: string }>
>

type DeleteNoteControllerResponse = Response<NoteResponse>

export const deleteNoteController = async (
  req: DeleteNoteControllerRequest,
  res: DeleteNoteControllerResponse
) => {
  try {
    const note = await prismaClient.note.delete({
      select: noteSelect,
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
