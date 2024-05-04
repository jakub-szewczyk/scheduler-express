import { Router } from 'express'
import { getIssuesController } from '../controllers/issue'
import { getIssuesValidator } from '../validators/issue'

const router = Router()

// TODO: Document
router.get(
  '/:projectId/boards/:boardId/statuses/:statusId/issues',
  getIssuesValidator,
  getIssuesController
)

export default router
