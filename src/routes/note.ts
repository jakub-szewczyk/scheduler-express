import { Router } from 'express'
import {
  createNoteController,
  getNoteController,
  getNotesController,
  updateNoteController,
} from '../controllers/note'
import {
  createNoteValidator,
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

export default router
