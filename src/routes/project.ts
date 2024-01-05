import { Router } from 'express'
import {
  createProjectController,
  deleteProjectController,
  getProjectsController,
  updateProjectController,
} from '../controllers/project'
import {
  createProjectValidator,
  deleteProjectValidator,
  getProjectsValidator,
  updateProjectValidator,
} from '../validators/project'

const router = Router()

/**
 * @openapi
 * /api/projects:
 *   get:
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
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Invalid query params
 *       500:
 *         description: Unexpected server error
 */
router.get('/', getProjectsValidator, getProjectsController)

router.post('/', createProjectValidator, createProjectController)

router.put('/:projectId', updateProjectValidator, updateProjectController)

router.delete('/:projectId', deleteProjectValidator, deleteProjectController)

export default router
