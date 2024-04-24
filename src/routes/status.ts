import { Router } from 'express'
import {
  createStatusController,
  getStatusController,
  getStatusesController,
  updateStatusController,
} from '../controllers/status'
import {
  createStatusValidator,
  getStatusValidator,
  getStatusesValidator,
  updateStatusValidator,
} from '../validators/status'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Status
 *     summary: Get all statuses
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
 *           example: 'Status #10'
 *     responses:
 *       200:
 *         description: Returns all statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Status'
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
router.get(
  '/:projectId/boards/:boardId/statuses',
  getStatusesValidator,
  getStatusesController
)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses/{statusId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Status
 *     summary: Get one status
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
 *       - in: path
 *         name: statusId
 *         schema:
 *           type: string
 *           example: 080434b9-5677-4879-a293-eb82a2d29e1e
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Status'
 *       404:
 *         description: Status not found
 */
router.get(
  '/:projectId/boards/:boardId/statuses/:statusId',
  getStatusValidator,
  getStatusController
)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Status
 *     summary: Create status
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
 *             $ref: '#/components/schemas/StatusBody'
 *     responses:
 *       201:
 *         description: Returns created status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Status'
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
 *                     example: 'Status #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your statuses
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/boards/:boardId/statuses',
  createStatusValidator,
  createStatusController
)

// TODO: Document
router.put(
  '/:projectId/boards/:boardId/statuses/:statusId',
  updateStatusValidator,
  updateStatusController
)

export default router
