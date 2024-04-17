import { Router } from 'express'
import { getStatusesValidator } from '../validators/status'
import { getStatusesController } from '../controllers/status'

const router = Router()

router.get(
  '/:projectId/boards/:boardId/statuses',
  getStatusesValidator,
  getStatusesController
)

export default router
