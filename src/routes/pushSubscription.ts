import { Router } from 'express'
import { createPushSubscriptionController } from '../controllers/pushSubscription'
import { createPushSubscriptionValidator } from '../validators/pushSubscription'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}/notification/push-subscriptions:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PushSubscription
 *     summary: Create push subscription
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Entity'
 *     responses:
 *       201:
 *         description: Returns created push subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/PushSubscription'
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
 *                   msg:
 *                     type: string
 *                     example: Push subscription endpoint is missing
 *                   path:
 *                     type: string
 *                     example: endpoint
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification/push-subscriptions',
  createPushSubscriptionValidator,
  createPushSubscriptionController
)

export default router
