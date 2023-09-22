import { Router } from 'express'
import { getNotesController } from '../controllers/note'
import { getNotesValidator } from '../validators/note'

const router = Router()

router.get('/:projectId/notes', getNotesValidator, getNotesController)

export default router
