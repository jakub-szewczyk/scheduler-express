import { Router } from 'express'
import {
  createEventController,
  deleteEventController,
  getEventController,
  getEventsController,
  updateEventController,
} from '../controllers/event'
import {
  createEventValidator,
  deleteEventValidator,
  getEventValidator,
  getEventsValidator,
  updateEventValidator,
} from '../validators/event'

const router = Router()

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Event
 *     summary: Get all events
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
 *           example: 'Event #10'
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *       - in: query
 *         name: startAt
 *         schema:
 *           type: string
 *           example: 2024-04-02T13:07:37.603Z
 *       - in: query
 *         name: endAt
 *         schema:
 *           type: string
 *           example: 2024-04-03T03:51:13.040Z
 *     responses:
 *       200:
 *         description: Returns all events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
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
  '/:projectId/schedules/:scheduleId/events',
  getEventsValidator,
  getEventsController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Event
 *     summary: Get one event
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
 *         description: Returns one event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
router.get(
  '/:projectId/schedules/:scheduleId/events/:eventId',
  getEventValidator,
  getEventController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Event
 *     summary: Create event
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
 *             $ref: '#/components/schemas/EventBody'
 *     responses:
 *       201:
 *         description: Returns created event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Event'
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
 *                     example: 'Event #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your events
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.post(
  '/:projectId/schedules/:scheduleId/events',
  createEventValidator,
  createEventController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Event
 *     summary: Update event
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
 *             $ref: '#/components/schemas/EventBody'
 *     responses:
 *       200:
 *         description: Returns updated event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Event'
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
 *                     example: 'Event #1'
 *                   msg:
 *                     type: string
 *                     example: This title has already been used by one of your events
 *                   path:
 *                     type: string
 *                     example: title
 *                   location:
 *                     type: string
 *                     example: body
 */
router.put(
  '/:projectId/schedules/:scheduleId/events/:eventId',
  updateEventValidator,
  updateEventController
)

/**
 * @openapi
 * /api/projects/{projectId}/schedules/{scheduleId}/events/{eventId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Event
 *     summary: Delete event
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
 *         description: Returns deleted event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
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
 *                     example: Event not found
 *                   path:
 *                     type: string
 *                     example: eventId
 *                   location:
 *                     type: string
 *                     example: params
 */
router.delete(
  '/:projectId/schedules/:scheduleId/events/:eventId',
  deleteEventValidator,
  deleteEventController
)

export default router
