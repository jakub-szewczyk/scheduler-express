import { Router } from 'express'
import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  getProjectsController,
  updateProjectController,
} from '../controllers/project'
import {
  createProjectValidator,
  deleteProjectValidator,
  getProjectValidator,
  getProjectsValidator,
  updateProjectValidator,
} from '../validators/project'

const router = Router()

/**
 * @openapi
 * /api/projects:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Project
 *     summary: Get all projects
 *     parameters:
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
 *         name: name
 *         schema:
 *           type: string
 *           default: 'Project #10'
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Returns all projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Page number must be a non-negative integer
 */
router.get('/', getProjectsValidator, getProjectsController)

/**
 * @openapi
 * /api/projects/{projectId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Project
 *     summary: Get one project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: 'clrssbgnw00012uhbmyxgs3uf'
 *         required: true
 *     responses:
 *       200:
 *         description: Returns one project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/ProjectDetails'
 *       404:
 *         description: Project not found
 */
router.get('/:projectId', getProjectValidator, getProjectController)

/**
 * @openapi
 * /api/projects:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Project
 *     summary: Create project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectBody'
 *     responses:
 *       201:
 *         description: Returns created project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This name has already been used by one of your projects
 */
router.post('/', createProjectValidator, createProjectController)

/**
 * @openapi
 * /api/projects/{projectId}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Project
 *     summary: Update project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: 'clrssbgnw00012uhbmyxgs3uf'
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectBody'
 *     responses:
 *       200:
 *         description: Returns updated project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have to give your project a unique name
 */
router.put('/:projectId', updateProjectValidator, updateProjectController)

/**
 * @openapi
 * /api/projects/{projectId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Project
 *     summary: Delete project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *           example: 'clrssbgnw00012uhbmyxgs3uf'
 *         required: true
 *     responses:
 *       200:
 *         description: Returns deleted project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project not found
 */
router.delete('/:projectId', deleteProjectValidator, deleteProjectController)

export default router
