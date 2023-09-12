import { Router } from 'express'
import { getBoardController, getBoardsController } from '../controllers/board'
import { getBoardValidator, getBoardsValidator } from '../validators/board'

const router = Router()

router.get('/:projectId/boards', getBoardsValidator, getBoardsController)

router.get('/:projectId/boards/:boardId', getBoardValidator, getBoardController)

export default router
