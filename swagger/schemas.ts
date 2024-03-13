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
 *           example: clqthe0ja00002uevktkmoy6q
 *         createdAt:
 *           type: string
 *           example: 2023-12-31T12:41:53.207Z
 *         name:
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
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: 'Project #1'
 *         description:
 *           type: string
 *           example: Edit your project's title and description. Manage your notes, boards and schedules within it.
 */
