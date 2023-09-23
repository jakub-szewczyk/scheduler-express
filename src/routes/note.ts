import { Router } from 'express'
import {
  createNoteController,
  getNoteController,
  getNotesController,
} from '../controllers/note'
import {
  createNoteValidator,
  getNoteValidator,
  getNotesValidator,
} from '../validators/note'

const router = Router()

router.get('/:projectId/notes', getNotesValidator, getNotesController)

router.get('/:projectId/notes/:noteId', getNoteValidator, getNoteController)

router.post('/:projectId/notes', createNoteValidator, createNoteController)

export default router
