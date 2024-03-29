import { Note, Prisma } from '@prisma/client'

export const NOTE: Pick<Note, 'title' | 'content'> = {
  title: 'Note #1',
  content: Prisma.JsonNull as unknown as Prisma.JsonValue,
}

export const noteSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.NoteSelect
