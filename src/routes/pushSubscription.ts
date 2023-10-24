import { Router } from 'express'
import { pushSubscriptionValidator } from '../validators/pushSubscription'
import { pushSubscriptionController } from '../controllers/pushSubscription'

const router = Router()

router.post('/', pushSubscriptionValidator, pushSubscriptionController)

export default router
