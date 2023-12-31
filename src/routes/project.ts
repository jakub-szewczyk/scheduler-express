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
  updateProjectValidator,
} from '../validators/project'

const router = Router()

// TODO: Validate pagination query params
router.get('/', getProjectsController)

router.post('/', createProjectValidator, createProjectController)

router.put('/:projectId', updateProjectValidator, updateProjectController)

router.delete('/:projectId', deleteProjectValidator, deleteProjectController)

export default router
