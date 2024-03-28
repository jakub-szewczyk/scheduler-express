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
 *           example: 074da7fd-a939-4879-a1d6-e2671a82cdfa
 *         createdAt:
 *           type: string
 *           example: 2023-12-31T12:41:53.207Z
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
 *           example: clrssbi1c02m02uhbxrgdhnk3
 *         createdAt:
 *           type: string
 *           example: 2023-12-31T12:41:53.207Z
 *         title:
 *           type: string
 *           example: 'Schedule #1'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ScheduleDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clrssbi1c02m02uhbxrgdhnk3
 *         createdAt:
 *           type: string
 *           example: 2023-12-31T12:41:53.207Z
 *         title:
 *           type: string
 *           example: 'Schedule #1'
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Row'
 *           example:
 *             - id: clrssbi1c02m12uhb4oymnoqc
 *               rowId: null
 *               index: 0
 *               day: Monday
 *               starts: null
 *               ends: null
 *               room: null
 *               subject: null
 *               notification: null
 *             - id: clrssbi1c02m22uhbdy1w65e2
 *               rowId: null
 *               index: 1
 *               day: Tuesday
 *               starts: null
 *               ends: null
 *               room: null
 *               subject: null
 *               notification: null
 *             - id: clrssbi1c02m32uhbdt9fejkd
 *               rowId: null
 *               index: 2
 *               day: Wednesday
 *               starts: null
 *               ends: null
 *               room: null
 *               subject: null
 *               notification: null
 *             - id: clrssbi1c02m42uhb5wq6esbv
 *               rowId: null
 *               index: 3
 *               day: Thursday
 *               starts: null
 *               ends: null
 *               room: null
 *               subject: null
 *               notification: null
 *             - id: clrssbi1c02m52uhb6t5bfplr
 *               rowId: null
 *               index: 4
 *               day: Friday
 *               starts: null
 *               ends: null
 *               room: null
 *               subject: null
 *               notification: null
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
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Row:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: clrssbi1c02m12uhb4oymnoqc
 *         rowId:
 *           type: string
 *           example: null
 *           nullable: true
 *         index:
 *           type: integer
 *           example: 0
 *         day:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday]
 *           example: Monday
 *         starts:
 *           type: string
 *           nullable: true
 *           example: null
 *         ends:
 *           type: string
 *           nullable: true
 *           example: null
 *         room:
 *           type: string
 *           nullable: true
 *           example: null
 *         subject:
 *           type: string
 *           nullable: true
 *           example: null
 *         notification:
 *           type: string
 *           nullable: true
 *           example: null
 */
