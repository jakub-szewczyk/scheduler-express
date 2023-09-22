import { Router } from 'express'
import { getNoteController, getNotesController } from '../controllers/note'
import { getNoteValidator, getNotesValidator } from '../validators/note'

const router = Router()

router.get('/:projectId/notes', getNotesValidator, getNotesController)

router.get('/:projectId/notes/:noteId', getNoteValidator, getNoteController)

export default router
