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
 *           example: 'clrssbgnw00012uhbmyxgs3uf'
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
 *         name: name
 *         schema:
 *           type: string
 *           default: 'Schedule #10'
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Page number must be a non-negative integer
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
 *           example: 'clrssbgnw00012uhbmyxgs3uf'
 *         required: true
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: string
 *           example: 'clrssbi1c02m02uhbxrgdhnk3'
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/ScheduleDetails'
 *       404:
 *         description: Schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Schedule not found
 */
router.get(
  '/:projectId/schedules/:scheduleId',
  getScheduleValidator,
  getScheduleController
)

router.post(
  '/:projectId/schedules',
  createScheduleValidator,
  createScheduleController
)

router.put(
  '/:projectId/schedules/:scheduleId',
  updateScheduleValidator,
  updateScheduleController
)

router.delete(
  '/:projectId/schedules/:scheduleId',
  deleteScheduleValidator,
  deleteScheduleController
)

export default router
