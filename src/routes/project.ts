import { Router } from 'express'
import {
  createProjectController,
  getProjectsController,
  updateProjectController,
} from '../controllers/project'
import {
  createProjectValidator,
  updateProjectValidator,
} from '../validators/project'

const router = Router()

router.get('/', getProjectsController)

router.post('/', createProjectValidator, createProjectController)

router.put('/:projectId', updateProjectValidator, updateProjectController)

export default router
