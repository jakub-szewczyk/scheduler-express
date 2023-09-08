import { Router } from 'express'
import { getBoardsValidator } from '../validators/board'
import { getBoardsController } from '../controllers/board'

const router = Router()

router.get('/:projectId/boards', getBoardsValidator, getBoardsController)

export default router
