// import { WithAuthProp } from '@clerk/clerk-sdk-node'
// import { Note, Prisma } from '@prisma/client'
// import { validationResult } from 'express-validator'
// import prismaClient from '../client'
// import { Request, Response } from 'express'
//
// export const updateEditorStateController = async (
//   req: WithAuthProp<
//     Request<
//       { projectId: string; noteId: string },
//       object,
//       Pick<Note, 'editorState'>
//     >
//   >,
//   res: Response
// ) => {
//   const result = validationResult(req)
//   if (!result.isEmpty())
//     return res.status(400).json({ message: result.array()[0].msg })
//   try {
//     const note = await prismaClient.note.update({
//       select: {
//         id: true,
//         createdAt: true,
//         name: true,
//         editorState: true,
//       },
//       where: {
//         id: req.params.noteId,
//         project: {
//           id: req.params.projectId,
//           authorId: req.auth.userId!,
//         },
//       },
//       data: {
//         editorState: req.body.editorState as Prisma.JsonObject,
//       },
//     })
//     return res.json(note)
//   } catch (error) {
//     console.error(error)
//     return res.status(500).end()
//   }
// }
