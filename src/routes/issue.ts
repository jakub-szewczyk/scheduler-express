import { Router } from 'express'
import {
  createIssueController,
  getIssueController,
  getIssuesController,
  updateIssueController,
} from '../controllers/issue'
import {
  createIssueValidator,
  getIssueValidator,
  getIssuesValidator,
  updateIssueValidator,
} from '../validators/issue'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses/{statusId}/issues:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Issue
 *     summary: Get all issues
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
 *           example: 'Issue #10'
 *     responses:
 *       200:
 *         description: Returns all issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Issue'
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
  '/:projectId/boards/:boardId/statuses/:statusId/issues',
  getIssuesValidator,
  getIssuesController
)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses/{statusId}/issues/{issueId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Issue
 *     summary: Get one issue
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
 *       - in: path
 *         name: issueId
 *         schema:
 *           type: string
 *           example: 36681b55-a2a9-4e72-b7b5-225bd515cb4a
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Issue not found
 */
router.get(
  '/:projectId/boards/:boardId/statuses/:statusId/issues/:issueId',
  getIssueValidator,
  getIssueController
)

/**
 * @openapi
 * /api/projects/{projectId}/boards/{boardId}/statuses/{statusId}/issues:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Issue
 *     summary: Create issue
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IssueBody'
 *     responses:
 *       201:
 *         description: Returns created issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Issue'
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
 *                     example: 'Issue #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your issues
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/boards/:boardId/statuses/:statusId/issues',
  createIssueValidator,
  createIssueController
)

// TODO: Document
router.put(
  '/:projectId/boards/:boardId/statuses/:statusId/issues/:issueId',
  updateIssueValidator,
  updateIssueController
)

export default router
