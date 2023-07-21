import { Router } from 'express'
import {
  createProjectController,
  getProjectsController,
} from '../controllers/project'
import { createProjectValidator } from '../validators/project'

const router = Router()

router.get('/', getProjectsController)

router.post('/', createProjectValidator, createProjectController)

export default router
