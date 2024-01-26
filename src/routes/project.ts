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

router.get('/:projectId', getProjectValidator, getProjectController)

router.post('/', createProjectValidator, createProjectController)

router.put('/:projectId', updateProjectValidator, updateProjectController)

router.delete('/:projectId', deleteProjectValidator, deleteProjectController)

export default router
