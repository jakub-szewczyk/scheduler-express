import { Router } from 'express'
import {
  createBoardController,
  deleteBoardController,
  getBoardController,
  getBoardsController,
  updateBoardController,
} from '../controllers/board'
import {
  createBoardValidator,
  deleteBoardValidator,
  getBoardValidator,
  getBoardsValidator,
  updateBoardValidator,
} from '../validators/board'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/boards:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Board
 *     summary: Get all boards
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
 *           default: 'Board #10'
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Returns all boards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Board'
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
router.get('/:projectId/boards', getBoardsValidator, getBoardsController)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Board
 *     summary: Get one board
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *           example: 06f750b2-8815-461e-8b7f-f42e96ab973c
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Board'
 *       404:
 *         description: Board not found
 */
router.get('/:projectId/boards/:boardId', getBoardValidator, getBoardController)

/**
 * @openapi
 * /api/projects/{projectId}/boards:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Board
 *     summary: Create board
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
 *             $ref: '#/components/schemas/BoardBody'
 *     responses:
 *       201:
 *         description: Returns created board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Board'
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
 *                     example: 'Board #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your boards
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post('/:projectId/boards', createBoardValidator, createBoardController)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Board
 *     summary: Update board
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *           example: 06f750b2-8815-461e-8b7f-f42e96ab973c
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BoardBody'
 *     responses:
 *       200:
 *         description: Returns updated board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Board'
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
 *                     example: 'Board #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your boards
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.put(
  '/:projectId/boards/:boardId',
  updateBoardValidator,
  updateBoardController
)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Board
 *     summary: Delete board
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *           example: 06f750b2-8815-461e-8b7f-f42e96ab973c
 *         required: true
 *     responses:
 *       200:
 *         description: Returns deleted board
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Board'
 *       404:
 *         description: Board not found
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
 *                     example: 06f750b2-8815-461e-8b7f-f42e96ab973c
 *                   msg:
 *                     type: string
 *                     example: Board not found
 *                   path:
 *                     type: string
 *                     example: boardId
 *                   location:
 *                     type: string
 *                     example: params
 */
router.delete(
  '/:projectId/boards/:boardId',
  deleteBoardValidator,
  deleteBoardController
)

export default router
