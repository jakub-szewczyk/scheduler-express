// import { body, param } from 'express-validator'
// import prismaClient from '../client'
//
// export const updateIssueValidator = [
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
//   param('issueId')
//     .notEmpty()
//     .custom(async (issueId: string, { req }) => {
//       const issue = await prismaClient.issue.findUnique({
//         where: {
//           id: issueId,
//           status: {
//             id: req.params!.statusId,
//             board: {
//               id: req.params!.boardId,
//               project: {
//                 id: req.params!.projectId,
//                 authorId: req.auth.userId,
//               },
//             },
//           },
//         },
//       })
//       if (!issue) throw new Error('Issue not found')
//     }),
//   body('title')
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your issue a unique title')
//     .custom(async (title: string, { req }) => {
//       const issue = await prismaClient.issue.findFirst({
//         where: {
//           AND: [
//             { id: { not: req.params!.issueId } },
//             {
//               title,
//               status: {
//                 id: req.params!.statusId,
//                 board: {
//                   id: req.params!.boardId,
//                   project: {
//                     id: req.params!.projectId,
//                     authorId: req.auth.userId,
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       })
//       if (issue)
//         throw new Error(
//           'This name has already been used by one of your statuses'
//         )
//     }),
//   body('content')
//     .trim()
//     .notEmpty()
//     .withMessage('You have to give your issue some content'),
// ]
