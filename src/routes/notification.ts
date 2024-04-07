import { Router } from 'express'
import { getNotificationController } from '../controllers/notification'
import { getNotificationValidator } from '../validators/notification'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}/notification:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Get one notification
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
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *           example: 4a6e7431-6ef3-42d2-b608-70cdd2fe21bf
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Notification'
 */
router.get(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification',
  getNotificationValidator,
  getNotificationController
)

export default router
