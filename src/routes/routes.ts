import { Router } from 'express'
import boardRoutes from './board'
import editorStateRoutes from './editorState'
import issueRoutes from './issue'
import noteRoutes from './note'
import projectRoutes from './project'
import rowRoutes from './row'
import scheduleRoutes from './schedule'
import statusRoutes from './status'

const router = Router()

router.use('/projects', projectRoutes)

router.use('/projects', scheduleRoutes)

router.use('/projects', rowRoutes)

router.use('/projects', boardRoutes)

router.use('/projects', statusRoutes)

router.use('/projects', issueRoutes)

router.use('/projects', noteRoutes)

router.use('/projects', editorStateRoutes)

export default router
