/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: a8d2a211-83bc-4354-bf2d-9bc603c82668
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.879Z
 *         title:
 *           type: string
 *           example: 'Project #1'
 *         description:
 *           type: string
 *           example: Edit your project's title and description. Manage your notes, boards and schedules within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ProjectBody:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: 'Project #1'
 *         description:
 *           type: string
 *           example: Edit your project's title and description. Manage your notes, boards and schedules within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 44bc0029-14b2-4dd4-a538-99fbac92ef48
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Schedule #1'
 *         description:
 *           type: string
 *           example: Edit your schedule's title and description. Manage your events within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ScheduleBody:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: 'Schedule #1'
 *         description:
 *           type: string
 *           example: Edit your schedule's title and description. Manage your events within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 4a6e7431-6ef3-42d2-b608-70cdd2fe21bf
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Event #1'
 *         description:
 *           type: string
 *           example: Edit your event's title and description. Manage your notification within it.
 *         startsAt:
 *           type: string
 *           example: 2024-04-02T13:07:37.603Z
 *         endsAt:
 *           type: string
 *           example: 2024-04-03T03:51:13.040Z
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     EventBody:
 *       type: object
 *       required:
 *         - title
 *         - startsAt
 *         - endsAt
 *       properties:
 *         title:
 *           type: string
 *           example: 'Event #1'
 *         description:
 *           type: string
 *           example: Edit your event's title and description. Manage your notification within it.
 *         startsAt:
 *           type: string
 *           example: 2024-04-02T13:07:37.603Z
 *         endsAt:
 *           type: string
 *           example: 2024-04-03T03:51:13.040Z
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 119b58d1-82a2-44eb-ab2b-e5ba8ae1e870
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Notification #1'
 *         description:
 *           type: string
 *           example: Edit your notification's details. By subscribing to it, you'll receive reminders about your events.
 *         startsAt:
 *           type: string
 *           example: 2024-04-02T13:07:37.603Z
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     NotificationBody:
 *       type: object
 *       required:
 *         - startsAt
 *       properties:
 *         title:
 *           type: string
 *           example: 'Notification #1'
 *         description:
 *           type: string
 *           example: Edit your notification's details. By subscribing to it, you'll receive reminders about your events.
 *         startsAt:
 *           type: string
 *           example: 2024-04-02T13:07:37.603Z
 *         isActive:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     PushSubscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 0d6e6bbd-a0bc-40cf-85e7-9ae3d89a85d5
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         entity:
 *           $ref: '#/components/schemas/Entity'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Entity:
 *       type: object
 *       properties:
 *         endpoint:
 *           type: string
 *           example: https://fcm.googleapis.com/fcm/send/eNsunHSowLg:APA91bGvgTjCxTYkrZA6RBEFcEEfgiWsp-DCN9C51XfiV47d_sbV6vDxvjmzj_DJRVYJU4L_ogu4PWo5tlqM3kfrQbuArXw5X82oXUQqrjlg5oBAR0Ogg-1g6QAPtr5BkyjheMRD-54f
 *         expirationTime:
 *           type: string
 *           example: null
 *         keys:
 *           type: object
 *           properties:
 *             p256dh:
 *               type: string
 *               example: BOwwPr9UuVb32HyG5oOuC9mFJVr8uDs_mdbBDEM5uG5xfE4E1N6DsO9vmTvtv18ZGmzuZPUcfsW2gxBiNa-daBA
 *             auth:
 *               type: string
 *               example: B6hCa1S-W2CkCFyKs9h5qw
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 06f750b2-8815-461e-8b7f-f42e96ab973c
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Board #1'
 *         description:
 *           type: string
 *           example: Edit your board's title and description. Manage your issues within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     BoardBody:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: 'Board #1'
 *         description:
 *           type: string
 *           example: Edit your board's title and description. Manage your issues within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Status:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 080434b9-5677-4879-a293-eb82a2d29e1e
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Status #1'
 *         description:
 *           type: string
 *           example: Edit your status' title and description. Manage your issues within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     StatusBody:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: 'Status #1'
 *         description:
 *           type: string
 *           example: Edit your status' title and description. Manage your issues within it.
 *         prevStatusId:
 *           type: string
 *           example: 080434b9-5677-4879-a293-eb82a2d29e1e
 *         nextStatusId:
 *           type: string
 *           example: 45e26c5f-5eee-4928-a24c-481fcec79993
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Issue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 36681b55-a2a9-4e72-b7b5-225bd515cb4a
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Issue #1'
 *         description:
 *           type: string
 *           example: Edit your issue's title and description. Prioritize them based on your needs.
 *         priority:
 *           type: string
 *           enum: [TRIVIAL, MINOR, LOW, MEDIUM, HIGH, MAJOR, CRITICAL]
 *           example: MEDIUM
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     IssueBody:
 *       type: object
 *       required:
 *         - title
 *         - priority
 *       properties:
 *         title:
 *           type: string
 *           example: 'Issue #1'
 *         description:
 *           type: string
 *           example: Edit your issue's title and description. Prioritize them based on your needs.
 *         priority:
 *           type: string
 *           enum: [TRIVIAL, MINOR, LOW, MEDIUM, HIGH, MAJOR, CRITICAL]
 *           example: MEDIUM
 *         prevIssueId:
 *           type: string
 *           example: 36681b55-a2a9-4e72-b7b5-225bd515cb4a
 *         nextIssueId:
 *           type: string
 *           example: 740a7ce7-a2da-4450-8c76-d70c272fe093
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: e3e6f9dc-6f32-4fb5-8da2-c7bfa29dc120
 *         createdAt:
 *           type: string
 *           example: 2024-03-29T06:33:22.911Z
 *         title:
 *           type: string
 *           example: 'Note #1'
 *         description:
 *           type: string
 *           example: Edit your note's title and description. Manage your content within it.
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     NoteBody:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: 'Note #1'
 *         description:
 *           type: string
 *           example: Edit your note's title and description. Manage your content within it.
 */
