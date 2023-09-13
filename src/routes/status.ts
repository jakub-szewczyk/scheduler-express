import { Router } from 'express'
import { updateStatusesController } from '../controllers/status'
import { updateStatusesValidator } from '../validators/status'

const router = Router()

router.put(
  '/:projectId/boards/:boardId/statuses',
  updateStatusesValidator,
  updateStatusesController
)

export default router
