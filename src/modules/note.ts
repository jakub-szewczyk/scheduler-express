import { Prisma } from '@prisma/client'

export const NOTE: Prisma.NoteCreateWithoutProjectInput = {
  name: 'Note #1',
  editorState: Prisma.JsonNull,
}

export const noteData = ({
  name,
  editorState,
}: Prisma.NoteCreateWithoutProjectInput) =>
  Prisma.validator<Prisma.NoteCreateWithoutProjectInput>()({
    name,
    editorState,
  })
