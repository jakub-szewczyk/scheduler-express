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

router.get('/', getProjectsValidator, getProjectsController)

router.post('/', createProjectValidator, createProjectController)

router.put('/:projectId', updateProjectValidator, updateProjectController)

router.delete('/:projectId', deleteProjectValidator, deleteProjectController)

export default router
