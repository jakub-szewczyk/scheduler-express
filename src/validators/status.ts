// import { Issue } from '@prisma/client'
// import { body, param } from 'express-validator'
// import prismaClient from '../client'
// import { UpdateStatusesRequestBody } from '../controllers/status'
//
// export const updateStatusesValidator = [
//   param('projectId')
//     .notEmpty()
//     .custom(async (projectId: string, { req }) => {
//       const project = await prismaClient.project.findUnique({
//         where: {
//           id: projectId,
//           authorId: req.auth.userId,
//         },
//       })
//       if (!project) throw new Error('Project not found')
//     }),
//   param('boardId')
//     .notEmpty()
//     .custom(async (boardId: string, { req }) => {
//       const board = await prismaClient.board.findUnique({
//         where: {
//           id: boardId,
//           project: {
//             id: req.params!.projectId,
//             authorId: req.auth.userId,
//           },
//         },
//       })
//       if (!board) throw new Error('Board not found')
//     }),
//   body().isArray().withMessage('Expected payload must be an array'),
//   body('*.title')
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your status a unique title')
//     .toLowerCase()
//     .custom(async (title: string, { req }) => {
//       const titles = (req.body as UpdateStatusesRequestBody).map(
//         (status) => status.title
//       )
//       if (titles.indexOf(title) !== titles.lastIndexOf(title))
//         throw new Error(
//           'This title has already been used by one of your statuses'
//         )
//     }),
//   body('*.issues')
//     .isArray()
//     .withMessage('Expected field `issues` must be an array'),
//   body('*.issues.title')
//     .if(async (title: Issue['title'], { req, path }) => {
//       const [, index] = path.match(/\[(.*?)\]/)!
//       req.body[index].issue.title
//     })
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your issue a title'),
//   body('*.issues.content')
//     .if(async (content: Issue['content'], { req, path }) => {
//       const [, index] = path.match(/\[(.*?)\]/)!
//       req.body[index].issue.content
//     })
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your issue some content'),
// ]
//
// export const updateStatusValidator = [
//   param('projectId')
//     .notEmpty()
//     .custom(async (projectId: string, { req }) => {
//       const project = await prismaClient.project.findUnique({
//         where: {
//           id: projectId,
//           authorId: req.auth.userId,
//         },
//       })
//       if (!project) throw new Error('Project not found')
//     }),
//   param('boardId')
//     .notEmpty()
//     .custom(async (boardId: string, { req }) => {
//       const board = await prismaClient.board.findUnique({
//         where: {
//           id: boardId,
//           project: {
//             id: req.params!.projectId,
//             authorId: req.auth.userId,
//           },
//         },
//       })
//       if (!board) throw new Error('Board not found')
//     }),
//   param('statusId')
//     .notEmpty()
//     .custom(async (statusId: string, { req }) => {
//       const status = await prismaClient.status.findUnique({
//         where: {
//           id: statusId,
//           board: {
//             id: req.params!.boardId,
//             project: {
//               id: req.params!.projectId,
//               authorId: req.auth.userId,
//             },
//           },
//         },
//       })
//       if (!status) throw new Error('Status not found')
//     }),
//   body('title')
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your status a unique title')
//     .toLowerCase()
//     .custom(async (title: string, { req }) => {
//       const status = await prismaClient.status.findUnique({
//         where: {
//           AND: [
//             { id: { not: req.params!.statusId } },
//             { title, boardId: req.params!.boardId },
//           ],
//           title_boardId: { title, boardId: req.params!.boardId },
//         },
//       })
//       if (status)
//         throw new Error(
//           'This name has already been used by one of your statuses'
//         )
//     }),
// ]
