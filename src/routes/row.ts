import { Router } from 'express'
import { updateRowsController } from '../controllers/row'

const router = Router()

router.put(
  '/:projectId/schedules/:scheduleId/rows',
  /**
   * TODO:
   * Document endpoint in Postman.
   * Implement following validator.
   */
  // updateRowsValidator,
  updateRowsController
)

export default router
