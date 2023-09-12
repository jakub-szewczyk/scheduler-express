import { Router } from 'express'
import {
  createBoardController,
  getBoardController,
  getBoardsController,
} from '../controllers/board'
import {
  createBoardValidator,
  getBoardValidator,
  getBoardsValidator,
} from '../validators/board'

const router = Router()

router.get('/:projectId/boards', getBoardsValidator, getBoardsController)

router.get('/:projectId/boards/:boardId', getBoardValidator, getBoardController)

router.post('/:projectId/boards', createBoardValidator, createBoardController)

export default router
