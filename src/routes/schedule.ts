import { Router } from 'express'
import {
  createScheduleController,
  deleteScheduleController,
  getScheduleController,
  getSchedulesController,
  updateScheduleController,
} from '../controllers/schedule'
import {
  createScheduleValidator,
  deleteScheduleValidator,
  getScheduleValidator,
  getSchedulesValidator,
  updateScheduleValidator,
} from '../validators/schedule'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/schedules:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Schedule
 *     summary: Get all schedules
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
 *           example: 'Schedule #10'
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Returns all schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
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
  '/:projectId/schedules',
  getSchedulesValidator,
  getSchedulesController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Schedule
 *     summary: Get one schedule
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: string
 *           example: 44bc0029-14b2-4dd4-a538-99fbac92ef48
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule not found
 */
router.get(
  '/:projectId/schedules/:scheduleId',
  getScheduleValidator,
  getScheduleController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Schedule
 *     summary: Create schedule
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
 *             $ref: '#/components/schemas/ScheduleBody'
 *     responses:
 *       201:
 *         description: Returns created schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Schedule'
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
 *                     example: 'Schedule #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your schedules
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/schedules',
  createScheduleValidator,
  createScheduleController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Schedule
 *     summary: Update schedule
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: string
 *           example: 44bc0029-14b2-4dd4-a538-99fbac92ef48
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleBody'
 *     responses:
 *       200:
 *         description: Returns updated schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Schedule'
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
 *                     example: 'Schedule #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your schedules
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.put(
  '/:projectId/schedules/:scheduleId',
  updateScheduleValidator,
  updateScheduleController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Schedule
 *     summary: Delete schedule
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         required: true
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: string
 *           example: 44bc0029-14b2-4dd4-a538-99fbac92ef48
 *         required: true
 *     responses:
 *       200:
 *         description: Returns deleted schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule not found
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
 *                     example: 44bc0029-14b2-4dd4-a538-99fbac92ef48
 *                   msg:
 *                     type: string
 *                     example: Schedule not found
 *                   path:
 *                     type: string
 *                     example: scheduleId
 *                   location:
 *                     type: string
 *                     example: params
 */
router.delete(
  '/:projectId/schedules/:scheduleId',
  deleteScheduleValidator,
  deleteScheduleController
)

export default router
