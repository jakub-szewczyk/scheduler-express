import { Router } from 'express'
import {
  createBoardController,
  deleteBoardController,
  getBoardController,
  getBoardsController,
  updateBoardController,
} from '../controllers/board'
import {
  createBoardValidator,
  deleteBoardValidator,
  getBoardValidator,
  getBoardsValidator,
  updateBoardValidator,
} from '../validators/board'

const router = Router()

router.get('/:projectId/boards', getBoardsValidator, getBoardsController)

router.get('/:projectId/boards/:boardId', getBoardValidator, getBoardController)

router.post('/:projectId/boards', createBoardValidator, createBoardController)

router.put(
  '/:projectId/boards/:boardId',
  updateBoardValidator,
  updateBoardController
)

router.delete(
  '/:projectId/boards/:boardId',
  deleteBoardValidator,
  deleteBoardController
)

export default router
