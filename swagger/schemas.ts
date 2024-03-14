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
 *         name:
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
 *         name:
 *           type: string
 *           example: 'Schedule #1'
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Row'
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

// TODO: Define notification schema
