import { Router } from 'express'

const router = Router()

/**
 * TODO:
 * Extract controller.
 */
router.get('/', async (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Project #1',
      createdAt: new Date().toISOString(),
    },
  ])
})

export default router
