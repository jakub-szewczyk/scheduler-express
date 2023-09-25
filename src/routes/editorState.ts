import { Router } from 'express'
import { updateEditorStateValidator } from '../validators/editorState'
import { updateEditorStateController } from '../controllers/editorState'

const router = Router()

router.put(
  '/:projectId/notes/:noteId/editor-state',
  updateEditorStateValidator,
  updateEditorStateController
)

export default router
