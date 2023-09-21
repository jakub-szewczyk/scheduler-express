import { Router } from 'express'
import { updateIssueController } from '../controllers/issue'
import { updateIssueValidator } from '../validators/issue'

const router = Router()

router.patch(
  '/:projectId/boards/:boardId/statuses/:statusId/issues/:issueId',
  updateIssueValidator,
  updateIssueController
)

export default router
