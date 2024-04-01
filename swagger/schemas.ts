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
