import { Router } from 'express'
import {
  renameStatusesController,
  updateStatusesController,
} from '../controllers/status'
import {
  renameStatusValidator,
  updateStatusesValidator,
} from '../validators/status'

const router = Router()

router.put(
  '/:projectId/boards/:boardId/statuses',
  updateStatusesValidator,
  updateStatusesController
)

router.patch(
  '/:projectId/boards/:boardId/statuses/:statusId',
  renameStatusValidator,
  renameStatusesController
)

export default router
