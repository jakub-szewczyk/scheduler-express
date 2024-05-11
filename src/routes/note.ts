import { Router } from 'express'
import {
  createNoteController,
  deleteNoteController,
  getNoteController,
  getNotesController,
  updateNoteController,
} from '../controllers/note'
import {
  createNoteValidator,
  deleteNoteValidator,
  getNoteValidator,
  getNotesValidator,
  updateNoteValidator,
} from '../validators/note'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/notes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Note
 *     summary: Get all notes
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 10
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *           example: 'Note #10'
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Returns all notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 page:
 *                   type: integer
 *                   example: 0
 *                 size:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid query params
 *         content:
 *           application/json:
 *             schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  type:
 *                    type: string
 *                    example: field
 *                  value:
 *                    type: string
 *                    example: -1
 *                  msg:
 *                    type: string
 *                    example: Page number must be a non-negative integer
 *                  path:
 *                    type: string
 *                    example: page
 *                  location:
 *                    type: string
 *                    example: query
 */
router.get('/:projectId/notes', getNotesValidator, getNotesController)

/**
 * @openapi
 * /api/projects/{projectId}/notes/{noteId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Note
 *     summary: Get one note
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *           example: e3e6f9dc-6f32-4fb5-8da2-c7bfa29dc120
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 */
router.get('/:projectId/notes/:noteId', getNoteValidator, getNoteController)

/**
 * @openapi
 * /api/projects/{projectId}/notes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Note
 *     summary: Create note
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteBody'
 *     responses:
 *       201:
 *         description: Returns created note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: field
 *                   value:
 *                     type: string
 *                     example: 'Note #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your notes
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post('/:projectId/notes', createNoteValidator, createNoteController)

/**
 * @openapi
 * /api/projects/{projectId}/notes/{noteId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Note
 *     summary: Update note
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *           example: e3e6f9dc-6f32-4fb5-8da2-c7bfa29dc120
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteBody'
 *     responses:
 *       200:
 *         description: Returns updated note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: field
 *                   value:
 *                     type: string
 *                     example: 'Note #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your notes
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.put(
  '/:projectId/notes/:noteId',
  updateNoteValidator,
  updateNoteController
)

// TODO: Implement endpoint
// router.patch(
//   '/:projectId/notes/:noteId/content',
//   updateNoteContentValidator,
//   updateNoteContentController
// )

/**
 * @openapi
 * /api/projects/{projectId}/notes/{noteId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Note
 *     summary: Delete note
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: noteId
 *         schema:
 *           type: string
 *           example: e3e6f9dc-6f32-4fb5-8da2-c7bfa29dc120
 *         required: true
 *     responses:
 *       200:
 *         description: Returns deleted note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: field
 *                   value:
 *                     type: string
 *                     example: e3e6f9dc-6f32-4fb5-8da2-c7bfa29dc120
 *                   msg:
 *                     type: string
 *                     example: Note not found
 *                   path:
 *                     type: string
 *                     example: noteId
 *                   location:
 *                     type: string
 *                     example: params
 */
router.delete(
  '/:projectId/notes/:noteId',
  deleteNoteValidator,
  deleteNoteController
)

export default router
