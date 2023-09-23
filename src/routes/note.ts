import { Router } from 'express'
import {
  createNoteController,
  deleteNoteController,
  getNoteController,
  getNotesController,
  updateNoteController,
} from '../controllers/note'
import {
  createNoteValidator,
  deleteNoteValidator,
  getNoteValidator,
  getNotesValidator,
  updateNoteValidator,
} from '../validators/note'

const router = Router()

router.get('/:projectId/notes', getNotesValidator, getNotesController)

router.get('/:projectId/notes/:noteId', getNoteValidator, getNoteController)

router.post('/:projectId/notes', createNoteValidator, createNoteController)

router.put(
  '/:projectId/notes/:noteId',
  updateNoteValidator,
  updateNoteController
)

router.delete(
  '/:projectId/notes/:noteId',
  deleteNoteValidator,
  deleteNoteController
)

export default router
