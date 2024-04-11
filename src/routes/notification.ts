import { Router } from 'express'
import {
  createNotificationController,
  getNotificationController,
  updateNotificationController,
} from '../controllers/notification'
import {
  createNotificationValidator,
  getNotificationValidator,
  updateNotificationValidator,
} from '../validators/notification'

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

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}/notification:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Create notification
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
 *             $ref: '#/components/schemas/NotificationBody'
 *     responses:
 *       201:
 *         description: Returns created notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Notification'
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
 *                     example: 119b58d1-82a2-44eb-ab2b-e5ba8ae1e870
 *                   msg:
 *                     type: string
 *                     example: A notification for the specified event has already been created
 *                   path:
 *                     type: string
 *                     example: eventId
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification',
  createNotificationValidator,
  createNotificationController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}/notification:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Update notification
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
 *             $ref: '#/components/schemas/NotificationBody'
 *     responses:
 *       200:
 *         description: Returns updated notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Notification'
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
 *                     example: 119b58d1-82a2-44eb-ab2b-e5ba8ae1e870
 *                   msg:
 *                     type: string
 *                     example: A notification for the specified event has not yet been created
 *                   path:
 *                     type: string
 *                     example: eventId
 *                   location:
 *                     type: string
 *                     example: body
 */
router.put(
  '/:projectId/schedules/:scheduleId/events/:eventId/notification',
  updateNotificationValidator,
  updateNotificationController
)

export default router
