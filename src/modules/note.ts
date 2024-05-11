import { Note, Prisma } from '@prisma/client'

export const NOTE: Pick<Note, 'title' | 'description'> = {
  title: 'Note #1',
  description:
    "Edit your note's title and description. Manage your content within it.",
}

export const noteSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
} satisfies Prisma.NoteSelect
