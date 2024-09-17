import { Router } from 'express'
import { createPushSubscriptionController } from '../controllers/pushSubscription'
import { createPushSubscriptionValidator } from '../validators/pushSubscription'

const router = Router()

/**
 * @openapi
 * /api/push-subscriptions:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - PushSubscription
 *     summary: Create push subscription
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
  '/',
  createPushSubscriptionValidator,
  createPushSubscriptionController
)

export default router
